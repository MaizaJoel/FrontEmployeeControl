# Configuración de Variables de Entorno

## 📋 Descripción

Este proyecto utiliza variables de entorno para configurar la URL del backend de forma segura y flexible.

## 🔧 Configuración

### Desarrollo Local

1. El archivo `.env.development` ya está configurado con la URL del backend local:
   ```
   VITE_API_BASE_URL=https://localhost:7114/api
   ```

2. Si necesitas usar una URL diferente en tu máquina local, crea un archivo `.env.local`:
   ```
   VITE_API_BASE_URL=https://tu-url-local:puerto/api
   ```
   **Nota:** `.env.local` está en `.gitignore` y no se subirá a Git.

### Producción

1. Antes de hacer el build de producción, actualiza `.env.production` con la URL real de tu backend:
   ```
   VITE_API_BASE_URL=https://tu-backend-produccion.com/api
   ```

2. Alternativamente, puedes configurar la variable de entorno en tu plataforma de hosting (Vercel, Netlify, etc.):
   - Variable: `VITE_API_BASE_URL`
   - Valor: URL de tu backend en producción

## 🚀 Comandos

- **Desarrollo:** `npm run dev` (usa `.env.development` o `.env.local`)
- **Build Producción:** `npm run build` (usa `.env.production`)

## 🔒 Seguridad

- ✅ **NO** subas archivos `.env.local` a Git
- ✅ Los archivos `.env.development` y `.env.production` son templates y SÍ se suben
- ✅ Actualiza `.env.production` antes de hacer deploy
- ✅ Nunca incluyas credenciales o secrets en estas variables (solo URLs públicas)

## ❓ Troubleshooting

Si ves el error: `VITE_API_BASE_URL is not defined`:
1. Verifica que existe el archivo `.env.development` o `.env.production`
2. Reinicia el servidor de desarrollo (`npm run dev`)
3. Asegúrate de que la variable comienza con `VITE_`
