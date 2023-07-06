import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.shadowMap.enabled = true; // 设置渲染器中的阴影属性

  const fov = 45;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('black');

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
    mesh.receiveShadow = true; // 设置地面能被投射阴影，这样我们不需要关心地面投射阴影的问题
    mesh.rotation.x = Math.PI * -0.5;
    scene.add(mesh);
  }
  // 对于球体和立方体，我们需要设置他们都能投射阴影或者被投射阴影 castShadow & receiveShadow
  {
    const cubeSize = 4;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMat = new THREE.MeshPhongMaterial({ color: '#8AC' });
    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
    scene.add(mesh);
  }
  // 将在场景中放置一个盒子，这样我们可以看到墙壁和天花板的阴影效果
  {
    const cubeSize = 30;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMat = new THREE.MeshPhongMaterial({
      color: '#CCC',
      side: THREE.BackSide,
    });
    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    mesh.receiveShadow = true;
    mesh.position.set(0, cubeSize / 2 - 0.1, 0); // 它的高度设置的比地板稍微低一点，防止 Z 轴渲染重合。
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
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
    scene.add(mesh);
  }

  class ColorGUIHelper {
    constructor(object, prop) {
      this.object = object;
      this.prop = prop;
    }
    get value() {
      return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
      this.object[this.prop].set(hexString);
    }
  }

  class DimensionGUIHelper {
    constructor(obj, minProp, maxProp) {
      this.obj = obj;
      this.minProp = minProp;
      this.maxProp = maxProp;
    }
    get value() {
      return this.obj[this.maxProp] * 2;
    }
    set value(v) {
      this.obj[this.maxProp] = v / 2;
      this.obj[this.minProp] = v / -2;
    }
  }

  // 调整 near & far 的变化
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

  function makeXYZGUI(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
    folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
    folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
    folder.open();
  }

  {
    const color = 0xffffff;
    const intensity = 1;
    // const light = new THREE.DirectionalLight(color, intensity);
    const light = new THREE.PointLight(color, intensity);
    light.castShadow = true; // 设置光能投射阴影
    light.position.set(0, 10, 0);
    // light.target.position.set(-4, 0, -4);
    scene.add(light);
    // scene.add(light.target);

    const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
    scene.add(cameraHelper);

    // const helper = new THREE.DirectionalLightHelper(light);
    const helper = new THREE.PointLightHelper(light);
    scene.add(helper);

    // 更新光源
    function updateCamera() {
      // update the light target's matrixWorld because it's needed by the helper
      // light.target.updateMatrixWorld();
      helper.update();
      // update the light's shadow camera's projection matrix
      light.shadow.camera.updateProjectionMatrix();
      // and now update the camera helper we're using to show the light's shadow camera
      cameraHelper.update();
    }
    updateCamera();

    const onChange = () => {
      // light.target.updateMatrixWorld();
      helper.update();
    };
    onChange();

    const gui = new GUI();
    gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
    gui.add(light, 'intensity', 0, 2, 0.01);

    {
      const folder = gui.addFolder('Shadow Camera');
      folder.open();
      // folder
      //   .add(
      //     new DimensionGUIHelper(light.shadow.camera, 'left', 'right'),
      //     'value',
      //     1,
      //     100
      //   )
      //   .name('width')
      //   .onChange(updateCamera);
      // folder
      //   .add(
      //     new DimensionGUIHelper(light.shadow.camera, 'bottom', 'top'),
      //     'value',
      //     1,
      //     100
      //   )
      //   .name('height')
      //   .onChange(updateCamera);
      const minMaxGUIHelper = new MinMaxGUIHelper(
        light.shadow.camera,
        'near',
        'far',
        0.1
      );
      folder
        .add(minMaxGUIHelper, 'min', 0.1, 50, 0.1)
        .name('near')
        .onChange(updateCamera);
      folder
        .add(minMaxGUIHelper, 'max', 0.1, 50, 0.1)
        .name('far')
        .onChange(updateCamera);
      folder
        .add(light.shadow.camera, 'zoom', 0.01, 1.5, 0.01)
        .onChange(updateCamera);
    }

    makeXYZGUI(gui, light.position, 'position', onChange);
    // makeXYZGUI(gui, light.target.position, 'target', onChange);
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
    resizeRendererToDisplaySize(renderer);

    {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
