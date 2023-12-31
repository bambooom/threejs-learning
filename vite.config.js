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
        shadows: resolve(__dirname, 'examples/shadows.html'),
        shadows2: resolve(__dirname, 'examples/shadows2.html'),
        fog: resolve(__dirname, 'examples/fog.html'),
        rendertargets: resolve(__dirname, 'examples/rendertargets.html'),
        custombuffergeometry: resolve(__dirname, 'examples/custom-buffergeometry.html'),
        snowglobe: resolve(__dirname, 'examples/snowglobe.html'),
      },
    },
  },
});
