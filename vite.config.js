import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        fundamentals: resolve(__dirname, 'examples/01-fundamental.html'),
        primitives: resolve(__dirname, 'examples/02-primitives.html'),
        scenegraph: resolve(__dirname, 'examples/03-scenegraph.html'),
        tank: resolve(__dirname, 'examples/tank.html'),
        texture: resolve(__dirname, 'examples/04-texture.html'),
        lights: resolve(__dirname, 'examples/lights.html'),
        cameras: resolve(__dirname, 'examples/cameras.html'),
      },
    },
  },
});
