# Guía de Despliegue en Servidor Virtual (VPS) vía SSH

Esta guía detalla los pasos para desplegar la aplicación TalentoHR en un servidor Linux (ej. Ubuntu 22.04) al que se accede mediante SSH.

## 1. Preparación del Servidor

Conéctese a su servidor:
```bash
ssh usuario@ip-del-servidor
```

### Instalar dependencias básicas
Actualice el sistema e instale Node.js, PostgreSQL y Nginx.

```bash
# Actualizar repositorios
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (v20+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Instalar Nginx y Git
sudo apt install nginx git -y

# Instalar PM2 globalmente (para mantener el backend corriendo)
sudo npm install -g pm2
```

## 2. Configuración de la Base de Datos

Acceda a PostgreSQL y cree la base de datos y el usuario:

```bash
sudo -u postgres psql
```

Dentro de la consola de PostgreSQL:
```sql
CREATE DATABASE talento_hr;
CREATE USER talento_user WITH PASSWORD 'una_contraseña_segura';
GRANT ALL PRIVILEGES ON DATABASE talento_hr TO talento_user;
-- En versiones recientes de Postgres, asegúrese de dar permisos en el esquema public
\c talento_hr
GRANT ALL ON SCHEMA public TO talento_user;
\q
```

## 3. Clonar y Configurar el Proyecto

Elija un directorio para la aplicación (ej. `/var/www/talento-hr`):

```bash
sudo mkdir -p /var/www/talento-hr
sudo chown $USER:$USER /var/www/talento-hr
cd /var/www/talento-hr

# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO> .
```

### Configuración del Backend

1. Entre al directorio del servidor e instale dependencias:
   ```bash
   cd server
   npm install
   ```

2. Configure las variables de entorno:
   ```bash
   cp .env.example .env # Si existe, sino cree uno nuevo
   nano .env
   ```

   Contenido sugerido para `.env`:
   ```env
   DATABASE_URL="postgresql://talento_user:una_contraseña_segura@localhost:5432/talento_hr?schema=public"
   API_KEY="SU_CLAVE_GEMINI"
   PORT=3001
   JWT_SECRET="una_clave_aleatoria_y_larga"
   ```

3. Generar cliente Prisma y ejecutar migraciones:
   ```bash
   npx prisma generate
   npx prisma db push
   # Opcional: Cargar datos iniciales
   npm run seed
   ```

4. Construir el backend:
   ```bash
   npm run build
   ```

5. Iniciar con PM2:
   ```bash
   pm2 start dist/index.js --name "talento-backend"
   pm2 save
   ```

### Configuración del Frontend

1. Regrese a la raíz del proyecto e instale dependencias:
   ```bash
   cd ..
   npm install
   ```

2. Configure la URL de la API para el build:
   Cree un archivo `.env.production`:
   ```bash
   nano .env.production
   ```
   Contenido:
   ```env
   VITE_API_URL=https://su-dominio.com/api
   ```
   *(Si no tiene dominio, use `http://ip-del-servidor:3001/api`)*

3. Construir el frontend:
   ```bash
   npm run build
   ```
   Esto generará una carpeta `dist/` en la raíz.

## 4. Configuración de Nginx (Reverse Proxy)

Configure Nginx para servir el frontend y redirigir las peticiones `/api` al backend.

```bash
sudo nano /etc/nginx/sites-available/talento-hr
```

Contenido del archivo:
```nginx
server {
    listen 80;
    server_name su-dominio.com; # O la IP del servidor

    root /var/www/talento-hr/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Habilite el sitio y reinicie Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/talento-hr /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 5. Mantenimiento y Logs

- Ver logs del backend: `pm2 logs talento-backend`
- Reiniciar backend: `pm2 restart talento-backend`
- Actualizar código:
  ```bash
  git pull
  cd server && npm install && npm run build && pm2 restart talento-backend
  cd .. && npm install && npm run build
  ```
