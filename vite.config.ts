import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'; // <-- Убедитесь, что эта строка есть

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    // --- ДОБАВЛЕНО ДЛЯ GITHUB PAGES ---
    // Укажите здесь имя вашего репозитория на GitHub
    base: '/snake-game-classic/',
    // ------------------------------------

    plugins: [react()], // <-- ДОБАВЛЕН ПЛАГИН REACT

    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});