import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        fundamentals: resolve(__dirname, 'examples/01-fundamental.html'),
        primitives: resolve(__dirname, 'examples/02-primitives.html'),
      },
    },
  },
});
