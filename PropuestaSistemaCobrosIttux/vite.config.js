import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Esto establece la base relativa
  optimizeDeps: {
    include: [
      '@fullcalendar/react',
      '@fullcalendar/core',
      '@fullcalendar/common',
      '@fullcalendar/daygrid',
      '@fullcalendar/timegrid',
      '@fullcalendar/interaction',
    ],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Redirige las solicitudes a tu backend en el puerto 3001
        changeOrigin: true, // Cambia el origen de la solicitud al backend
        secure: false, // Desactiva la verificación SSL (solo útil para entornos de desarrollo)
      },
    },
  },
});
