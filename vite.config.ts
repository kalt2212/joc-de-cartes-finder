import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base path matches the GitHub Pages project URL: https://kalt2212.github.io/joc-de-cartes-finder/
export default defineConfig({
  base: '/joc-de-cartes-finder/',
  plugins: [react()],
  test: { environment: 'node' },
});
