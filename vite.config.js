import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        fundamentals: resolve(__dirname, 'examples/fundamental.html'),
        primitives: resolve(__dirname, 'examples/primitives.html'),
        scenegraph: resolve(__dirname, 'examples/scenegraph.html'),
        tank: resolve(__dirname, 'examples/tank.html'),
        texture: resolve(__dirname, 'examples/texture.html'),
        lights: resolve(__dirname, 'examples/lights.html'),
        cameras: resolve(__dirname, 'examples/cameras.html'),
      },
    },
  },
});
