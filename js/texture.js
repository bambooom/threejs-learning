import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// 以弧度为单位设置该属性
class DegRadHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }
  get value() {
    return THREE.MathUtils.radToDeg(this.obj[this.prop]);
  }
  set value(v) {
    this.obj[this.prop] = THREE.MathUtils.degToRad(v);
  }
}

// 将 "123" 这样的字符串转换为 123 这样的数字
class StringToNumberHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }
  get value() {
    return this.obj[this.prop];
  }
  set value(v) {
    this.obj[this.prop] = parseFloat(v);
  }
}

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  const scene = new THREE.Scene();

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  const cubes = []; // just an array we can use to rotate the cubes
  // 用 TextureLoader 加载纹理
  const loader1 = new THREE.TextureLoader();

  // 可以异步等待加载完成后再渲染
  // loader.load('resources/images/wall.jpg', (texture) => {
  //   const material = new THREE.MeshBasicMaterial({
  //     map: texture,
  //   });
  //   const cube = new THREE.Mesh(geometry, material);
  //   scene.add(cube);
  //   cubes.push(cube); // 添加到我们要旋转的立方体数组中
  // });

  const texture = loader1.load(
    'https://threejs.org/manual/examples/resources/images/wall.jpg'
  );
  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });

  const cube1 = new THREE.Mesh(geometry, material);
  cube1.position.x = 1;
  scene.add(cube1);
  cubes.push(cube1); // 添加到我们要旋转的立方体数组中

  const wrapModes = {
    ClampToEdgeWrapping: THREE.ClampToEdgeWrapping,
    RepeatWrapping: THREE.RepeatWrapping,
    MirroredRepeatWrapping: THREE.MirroredRepeatWrapping,
  };

  function updateTexture() {
    texture.needsUpdate = true;
  }

  // 设置 UI 可以调整参数查看效果
  const gui = new GUI();
  gui
    .add(new StringToNumberHelper(texture, 'wrapS'), 'value', wrapModes)
    .name('texture.wrapS')
    .onChange(updateTexture);
  gui
    .add(new StringToNumberHelper(texture, 'wrapT'), 'value', wrapModes)
    .name('texture.wrapT')
    .onChange(updateTexture);
  gui.add(texture.repeat, 'x', 0, 5, 0.01).name('texture.repeat.x');
  gui.add(texture.repeat, 'y', 0, 5, 0.01).name('texture.repeat.y');
  gui.add(texture.offset, 'x', -2, 2, 0.01).name('texture.offset.x');
  gui.add(texture.offset, 'y', -2, 2, 0.01).name('texture.offset.y');
  gui.add(texture.center, 'x', -0.5, 1.5, 0.01).name('texture.center.x');
  gui.add(texture.center, 'y', -0.5, 1.5, 0.01).name('texture.center.y');
  gui
    .add(new DegRadHelper(texture, 'rotation'), 'value', -360, 360)
    .name('texture.rotation');

  // 在材料上加载纹理
  // const material = new THREE.MeshBasicMaterial({
  //   map: loader.load(
  //     'https://threejs.org/manual/examples/resources/images/wall.jpg'
  //   ),
  // });
  // const cube = new THREE.Mesh(geometry, material);

  // 如果想要等待多个纹理一起加载完成后再渲染，可以用 LoadingManager
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);

  // 假设要在六个面用上不同的纹理，需要分别创建6个material，然后创建 cube 的时候用上
  const materials = [
    new THREE.MeshBasicMaterial({
      // 初始纹理将是透明的，直到图片被three.js异步加载完成，这时它将用下载的图片更新纹理。
      map: loader.load(
        'https://threejs.org/manual/examples/resources/images/flower-1.jpg'
      ),
    }),
    new THREE.MeshBasicMaterial({
      map: loader.load(
        'https://threejs.org/manual/examples/resources/images/flower-2.jpg'
      ),
    }),
    new THREE.MeshBasicMaterial({
      map: loader.load(
        'https://threejs.org/manual/examples/resources/images/flower-3.jpg'
      ),
    }),
    new THREE.MeshBasicMaterial({
      map: loader.load(
        'https://threejs.org/manual/examples/resources/images/flower-4.jpg'
      ),
    }),
    new THREE.MeshBasicMaterial({
      map: loader.load(
        'https://threejs.org/manual/examples/resources/images/flower-5.jpg'
      ),
    }),
    new THREE.MeshBasicMaterial({
      map: loader.load(
        'https://threejs.org/manual/examples/resources/images/flower-6.jpg'
      ),
    }),
  ];
  // const cube = new THREE.Mesh(geometry, materials);
  // scene.add(cube);
  // cubes.push(cube); // add to our list of cubes to rotate

  const loadingElem = document.querySelector('#loading');
  const progressBarElem = loadingElem.querySelector('.progressbar');

  // loaderManager 有一个 onProgress 回调，可以在这里更新进度条
  loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
    const progress = itemsLoaded / itemsTotal;
    progressBarElem.style.transform = `scaleX(${progress})`;
  };

  // 等待所有纹理加载完成后再渲染
  loadManager.onLoad = () => {
    loadingElem.style.display = 'none'; // 隐藏进度条
    const cube = new THREE.Mesh(geometry, materials);
    cube.position.x = -1;
    scene.add(cube);
    cubes.push(cube); // 添加到我们要旋转的立方体数组中
  };

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
      const speed = 0.2 + ndx * 0.1;
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
