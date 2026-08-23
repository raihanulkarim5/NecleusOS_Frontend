import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // bind to 0.0.0.0 so it's reachable through Codespaces/devcontainer port forwarding
    port: 5173,
  },
});
