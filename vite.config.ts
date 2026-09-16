import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 會把站台放在 https://<owner>.github.io/<repo>/ 底下，
// 所以 build 時要把 base 設成 /<repo>/。本機 dev 維持 '/'。
// 由 CI 用 VITE_BASE 傳進來，沒傳就是 '/'。
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  server: { port: 5173, open: false },
});
