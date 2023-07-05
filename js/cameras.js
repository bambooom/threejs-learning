import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
    logarithmicDepthBuffer: true, // 可以解决z冲突问题，但在移动设备上不支持这个功能，并且会大大降低运行速度。大小的 near 和太大的far最终都会遇到问题
  });
  // 分别两个视窗口
  const view1Elem = document.querySelector('#view1');
  const view2Elem = document.querySelector('#view2');

  const fov = 45;
  const aspect = 2; // the canvas default
  const near = 0.00001;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);

  // 调整near，far的设置，调整 camera 的设置
  class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
      this.obj = obj;
      this.minProp = minProp;
      this.maxProp = maxProp;
      this.minDif = minDif;
    }
    get min() {
      return this.obj[this.minProp];
    }
    set min(v) {
      this.obj[this.minProp] = v;
      this.obj[this.maxProp] = Math.max(
        this.obj[this.maxProp],
        v + this.minDif
      );
    }
    get max() {
      return this.obj[this.maxProp];
    }
    set max(v) {
      this.obj[this.maxProp] = v;
      this.min = this.min; // this will call the min setter
    }
  }

  // function updateCamera() {
  //   // 更新 camera 的设置
  //   camera.updateProjectionMatrix();
  // }

  // 注意我们并没有改变aspect，因为这个参数来自于窗口的大小. 如果想调整aspect，只需要开个新窗口然后调整窗口大小就可以了。
  const gui = new GUI();
  gui.add(camera, 'fov', 1, 180);
  // .onChange(updateCamera);
  const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
  gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near');
  // .onChange(updateCamera);
  gui.add(minMaxGUIHelper, 'max', 0.1, 100, 0.1).name('far');
  // .onChange(updateCamera);

  // const controls = new OrbitControls(camera, camera);
  // 只给第一个视窗中的摄像机分别 OrbitControls
  const controls = new OrbitControls(camera, view1Elem);
  controls.target.set(0, 5, 0);
  controls.update();

  // 定义第二个视窗中的摄像机 PerspectiveCamera和OrbitControls
  const camera2 = new THREE.PerspectiveCamera(
    60, // fov
    2, // aspect
    0.1, // near
    500 // far
  );
  camera2.position.set(40, 10, 30);
  camera2.lookAt(0, 5, 0);

  const controls2 = new OrbitControls(camera2, view2Elem);
  controls2.target.set(0, 5, 0);
  controls2.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('black');

  // CameraHelper 可以把摄像机的视锥画出来；
  const cameraHelper = new THREE.CameraHelper(camera);
  scene.add(cameraHelper);

  {
    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      'https://threejs.org/manual/examples/resources/images/checker.png'
    );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -0.5;
    scene.add(mesh);
  }
  {
    const cubeSize = 4;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMat = new THREE.MeshPhongMaterial({ color: '#8AC' });
    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
    scene.add(mesh);
  }
  {
    const sphereRadius = 3;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry(
      sphereRadius,
      sphereWidthDivisions,
      sphereHeightDivisions
    );
    const sphereMat = new THREE.MeshPhongMaterial({ color: '#CA8' });
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
    scene.add(mesh);
  }

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
  }

  // 假设在场景中添加20个球，并把near=0.00001
  // 会出现典型的z冲突的例子，意思是 GPU 没有足够的精度来决定哪个像素在前哪个在后
  // 解决的方法是需要在创建WebGLRenderer时开启logarithmicDepthBuffer
  {
    const sphereRadius = 3;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereBufferGeometry(
      sphereRadius,
      sphereWidthDivisions,
      sphereHeightDivisions
    );
    const numSpheres = 20;
    for (let i = 0; i < numSpheres; i++) {
      const sphereMat = new THREE.MeshPhongMaterial();
      sphereMat.color.setHSL(i * 0.73, 1, 0.5);
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(
        -sphereRadius - 1,
        sphereRadius + 2,
        i * sphereRadius * -2.2
      );
      scene.add(mesh);
    }
  }

  // 需要使用剪刀功能从每个摄影机的视角渲染场景，以仅渲染画布的一部分。
  // 这个函数接受一个元素，计算这个元素在canvas上的重叠面积，
  // 然后这将设置剪刀函数和视角长宽并返回 aspect ：
  function setScissorForElement(elem) {
    const canvasRect = canvas.getBoundingClientRect();
    const elemRect = elem.getBoundingClientRect();

    // 计算 canvas 的尺寸
    const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
    const left = Math.max(0, elemRect.left - canvasRect.left);
    const bottom =
      Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
    const top = Math.max(0, elemRect.top - canvasRect.top);

    const width = Math.min(canvasRect.width, right - left);
    const height = Math.min(canvasRect.height, bottom - top);

    // 设置剪函数以仅渲染一部分场景
    const positiveYUpBottom = canvasRect.height - bottom;
    renderer.setScissor(left, positiveYUpBottom, width, height);
    renderer.setViewport(left, positiveYUpBottom, width, height);

    // 返回 aspect
    return width / height;
  }

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

  function render() {
    // if (resizeRendererToDisplaySize(renderer)) {
    //   const canvas = renderer.domElement;
    //   camera.aspect = canvas.clientWidth / canvas.clientHeight;
    //   camera.updateProjectionMatrix();
    // }

    resizeRendererToDisplaySize(renderer);
    // 启用剪刀函数
    renderer.setScissorTest(true);

    // 渲染主视野
    {
      const aspect = setScissorForElement(view1Elem);

      // 用计算出的 aspect修改camera参数
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      cameraHelper.update();

      // 在原视野中不要绘制 cameraHelper
      cameraHelper.visible = false;

      scene.background.set(0x000000);
      // 渲染
      renderer.render(scene, camera);
    }

    // 渲染第二台摄像机
    {
      const aspect = setScissorForElement(view2Elem);

      // 调整aspect
      camera2.aspect = aspect;
      camera2.updateProjectionMatrix();

      // 在第二台摄像机中绘制camaraHelper
      cameraHelper.visible = true;
      scene.background.set(0x000040);
      renderer.render(scene, camera2);
    }

    // renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
