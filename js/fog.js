import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  const gui = new GUI();

  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  const scene = new THREE.Scene();

  // We use this class to pass to lil-gui
  // so when it manipulates near or far
  // near is never > far and far is never < near
  // Also when lil-gui manipulates color we'll
  // update both the fog and background colors.
  class FogGUIHelper {
    constructor(fog) {
      this.fog = fog;
      this.backgroundColor = backgroundColor;
    }
    get near() {
      return this.fog.near;
    }
    set near(v) {
      this.fog.near = v;
      this.fog.far = Math.max(this.fog.far, v);
    }
    get far() {
      return this.fog.far;
    }
    set far(v) {
      this.fog.far = v;
      this.fog.near = Math.min(this.fog.near, v);
    }
    get color() {
      return `#${this.fog.color.getHexString()}`;
    }
    set color(hexString) {
      this.fog.color.set(hexString);
      this.backgroundColor.set(hexString);
    }
  }

  {
    const near = 1;
    const far = 2;
    const color = 'lightblue';
    scene.fog = new THREE.Fog(color, near, far); // 设置fog效果
    scene.background = new THREE.Color(color); // fog 的颜色应该和背景颜色一致
    // 雾是作用在 渲染的物体 上的，是物体颜色中每个像素计算的一部分。
    // 这意味着如果你想让你的场景褪色到某种颜色，你需要设定雾 和 场景的背景颜色为同一种颜色。
    // 背景颜色通过scene.background属性设置。你可以通过 THREE.Color 选择背景颜色设置。

    const fogGUIHelper = new FogGUIHelper(scene.fog);
    gui.add(fogGUIHelper, 'near', near, far).listen();
    gui.add(fogGUIHelper, 'far', near, far).listen();
    gui.addColor(fogGUIHelper, 'color');
  }

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  function makeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({ color });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cube.position.x = x;

    return cube;
  }

  const cubes = [
    makeInstance(geometry, 0x44aa88, 0),
    makeInstance(geometry, 0x8844aa, -2),
    makeInstance(geometry, 0xaa8844, 2),
  ];

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    cubes.forEach((cube, ndx) => {
      const speed = 1 + ndx * 0.1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    });

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
