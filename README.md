# Chech App - Axiom Tech

Aplicación de escritorio desarrollada con **Electron**, **React**, **Vite** y **Tailwind CSS** para la gestión de cheques.

## Requisitos Previos

- **Node.js**: Versión 18 o superior.
- **Backend**: El servidor de API debe estar en ejecución (repositorio `ChechApp_BackEnd`).
- **Icono**: Asegúrate de tener un archivo `public/icon.png` (256x256 px) para el instalador.

## Instalación y Desarrollo

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   ```
3. Iniciar en modo desarrollo:
   ```bash
   npm run electron-dev
   ```

## Despliegue y Empaquetado

### 1. Preparar el entorno

Asegúrate de que la URL de la API en `.env` sea la correcta para producción:

```env
VITE_API_URL=http://tu-servidor-produccion.com/api/v1
```

### 2. Generar el Build y el Instalador

```bash
npm run dist
```

### 3. Localizar los archivos

Los archivos resultantes estarán en la carpeta `release/`:
- **Instalador**: `Chech App Setup X.X.X.exe`
- **Versión Portable**: carpeta `win-unpacked`

## Estructura del Proyecto

```
ChechApp_FrontEnd/
├── electron/main.js       # Proceso principal de Electron
├── src/
│   ├── api/               # Hooks de React Query por dominio
│   ├── components/        # UI (shadcn), layout, auth
│   ├── lib/               # axios, socket, utils
│   ├── pages/             # Vistas por ruta
│   └── store/             # Redux (auth persistido)
└── public/                # Iconos estáticos
```

---
Desarrollado por Axiom Tech.
