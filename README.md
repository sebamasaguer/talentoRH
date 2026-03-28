# TalentoHR - Sistema de Gestión de Talento Interno

Este sistema permite la gestión profesional de recursos humanos, enfocándose en la reubicación de agentes (Oferta) y la cobertura de vacantes institucionales (Demanda) mediante el uso de Inteligencia Artificial (Gemini).

## 🚀 Guía de Instalación Local y Pruebas

Siga estos pasos para configurar el entorno de desarrollo en su máquina local.

### Prerrequisitos

*   **Node.js** (v20 o superior)
*   **PostgreSQL** (Instancia local o remota)
*   **Gemini API Key** (Obtenida de Google AI Studio)

---

### 1. Configuración del Backend

1.  Entre al directorio del servidor:
    ```bash
    cd server
    ```
2.  Instale las dependencias:
    ```bash
    npm install
    ```
3.  Configure las variables de entorno:
    Cree un archivo `.env` en la carpeta `server/` con el siguiente contenido:
    ```env
    DATABASE_URL="postgresql://usuario:password@localhost:5432/talento_hr?schema=public"
    API_KEY="SU_CLAVE_GEMINI"
    PORT=3001
    ```
4.  Genere el cliente de Prisma:
    ```bash
    npx prisma generate
    ```
5.  Sincronice la base de datos (Ejecute esto si es la primera vez):
    ```bash
    npx prisma db push
    ```
6.  Inicie el servidor de desarrollo:
    ```bash
    npm run dev
    ```
    El backend estará disponible en `http://localhost:3001`.

---

### 2. Configuración del Frontend

1.  Regrese a la raíz del proyecto e instale las dependencias:
    ```bash
    npm install
    ```
2.  Inicie el servidor de desarrollo de Vite:
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

---

### 3. Realización de Pruebas

Una vez que ambos servidores estén corriendo:

1.  **Carga de Datos:** Diríjase a "Agentes / Entrevistas" y cree un nuevo perfil. Verifique que los datos persistan al recargar la página.
2.  **Gestión de Pedidos:** Cargue una nueva búsqueda en la sección "Búsquedas / Pedidos".
3.  **Matching Inteligente:**
    *   Vaya a la pestaña "Matching Inteligente".
    *   Seleccione una vacante del menú desplegable.
    *   Haga clic en **"✨ Ejecutar Análisis AI"**.
    *   El sistema llamará a la API de Gemini, enviando los datos reales de la DB y retornará los 3 mejores candidatos con su respectiva justificación.

---

## 🛠️ Estructura Técnica

*   **Frontend:** React + TypeScript + Tailwind CSS.
*   **Backend:** Node.js + Express.
*   **ORM:** Prisma (PostgreSQL).
*   **IA:** Google Generative AI (Gemini 2.0 Flash).
*   **Validación:** Zod.
