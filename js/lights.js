import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// OrbitControls 让我们可以围绕某一个点旋转控制相机
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'; // https://github.com/georgealways/lil-gui
// import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
// import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  // 设置会影响（随着离光源的距离增加）光照如何减弱
  // renderer.physicallyCorrectLights = true;
  renderer.useLegacyLights = false;
  // 矩形灯光需要先init
  // RectAreaLightUniformsLib.init();

  const fov = 45;
  const aspect = 2; // canvas 的默认宽高 300:150
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20); // 移动相机到这个位置

  // 创建 OrbitControls 时传入两个参数，一个是要控制的相机对象，第二个是检测事件的 DOM 元素。
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0); // 观察点设置为 (0, 5, 0) 的位置，
  controls.update(); // 设置完需要调用一下 controls.update，这样才真正更新观察点位置。

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('black');

  {
    // 加载一个纹理，作为平面
    const planeSize = 40;
    const loader = new THREE.TextureLoader();
    // 图片是一个 2x2 像素的黑白格图片
    const texture = loader.load(
      'https://threejs.org/manual/examples/resources/images/checker.png'
    );
    texture.wrapS = THREE.RepeatWrapping; // 设置重复模式，意思是水平方向无限 repeat
    texture.wrapT = THREE.RepeatWrapping; // 设置重复模式，意思是垂直方向无限 repeat
    texture.magFilter = THREE.NearestFilter; // 当一个纹素覆盖大于一个像素时，贴图将如何采样， Nearest 使用最接近的纹素的值
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats); // 因为贴图是 2x2 大小，通过设置成平铺模式，并且重复次数是边长的一半，就可以让每个格子正好是1个单位的大小。

    // 创建一个平面几何体，一个材质，再用这两个作为参数，创建一个 Mesh 对象并且添加到场景中
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -0.5; // 平面默认是在 XY 平面上（竖直平面），我们希望得到一个 XZ 平面（水平平面），所以我们将他旋转 90°
    scene.add(mesh);
  }

  {
    // 添加一个立方体
    const cubeSize = 4;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMat = new THREE.MeshStandardMaterial({ color: '#8AC' });
    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
    scene.add(mesh);
  }
  {
    // 添加一个球体
    const sphereRadius = 3;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry(
      sphereRadius,
      sphereWidthDivisions,
      sphereHeightDivisions
    );
    const sphereMat = new THREE.MeshStandardMaterial({ color: '#CA8' });
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
    scene.add(mesh);
  }

  // 动态地改变光照的参数
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

  function makeXYZGUI(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
    folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
    folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
    folder.open();
  }

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

  {
    // 添加光源
    // const color = 0xffffff;
    // const skyColor = 0xb1e1ff; // light blue
    // const groundColor = 0xb97a20; // brownish orange
    // const intensity = 1;
    // // 环境光 （AmbientLight）只是简单地将材质的颜色与光照颜色进行叠加（PhotoShop 里的正片叠底模式），再乘以光照强度，没有立体感
    // // 环境光，没有方向，无法产生阴影,场景内任何一点受到的光照强度都是相同的，所以没有立体感
    // // const light = new THREE.AmbientLight(color, intensity);

    // // 换成半球光，也没有太大的立体感，需要与其他光照结合使用
    // const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    // scene.add(light);

    const color = 0xffffff;
    const intensity = 1;
    // const width = 12;
    // const height = 4;
    // 矩形区域光
    // const light = new THREE.RectAreaLight(color, intensity, width, height);
    // light.position.set(0, 10, 0);
    // light.rotation.x = THREE.MathUtils.degToRad(-90);

    // 点光源（PointLight）表示的是从一个点朝各个方向发射出光线的一种光照效果
    const light = new THREE.PointLight(color, intensity);
    light.power = 800; // 800 流明
    light.decay = 2;
    light.distance = Infinity;

    // 聚光灯：点光源被一个圆锥体限制住了光照的范围，聚光灯也有 target
    // const light = new THREE.SpotLight(color, intensity);
    // 方向光：常常用来表现太阳光照的效果。阴影很明显
    // const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    // light.target.position.set(-5, 0, 0);
    scene.add(light);
    // scene.add(light.target); // 方向光（DirectionalLight）的方向是从它的位置照向目标点的位置。

    // 这个 helper 绘制一个方形的小平面代表方向光的位置，一条连接光源与目标点的直线，代表了光的方向。
    // const helper = new THREE.DirectionalLightHelper(light);

    // PointLightHelper 不是一个点，而是在光源的位置绘制了一个小小的线框宝石体来代表点光源。也可以使用其他形状来表示点光源，只要给点光源添加一个自定义的 Mesh 子节点即可。
    const helper = new THREE.PointLightHelper(light);

    // const helper = new THREE.SpotLightHelper(light);

    // 矩形光不是使用目标点（target），而是使用自身的旋转角度来确定光照方向。另外，矩形光的辅助对象（RectAreaLightHelper）应该添加为光照的子节点，而不是添加为场景的子节点。
    // const helper = new RectAreaLightHelper(light);
    scene.add(helper);

    // 当辅助对象所表示的不可见对象有所改变的时候，我们必须调用辅助对象的 update 方法来更新辅助对象本身的状态。
    // function updateLight() {
    //   light.target.updateMatrixWorld();
    //   helper.update();
    // }
    // updateLight();

    const gui = new GUI();
    gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
    gui.add(light, 'decay', 0, 4, 0.01);
    gui.add(light, 'power', 0, 1220);

    // gui.add(light, 'intensity', 0, 2, 0.01);
    // // 点光源需要的 prop，如果 distance = 0，则光线可以照射到无限远处；如果大于 0，则只可以照射到指定的范围，光照强度在这个过程中逐渐衰减
    // // gui.add(light, 'distance', 0, 40).onChange(updateLight);
    // // 聚光灯的圆锥顶部角度大小通过 angle 属性设置，以弧度作单位
    // gui.add(light, 'width', 0, 20);
    // gui.add(light, 'height', 0, 20);
    // gui
    //   .add(new DegRadHelper(light.rotation, 'x'), 'value', -180, 180)
    //   .name('x rotation');
    // gui
    //   .add(new DegRadHelper(light.rotation, 'y'), 'value', -180, 180)
    //   .name('y rotation');
    // gui
    //   .add(new DegRadHelper(light.rotation, 'z'), 'value', -180, 180)
    //   .name('z rotation');

    // gui
    //   .add(new DegRadHelper(light, 'angle'), 'value', 0, 90)
    //   .name('angle')
    //   .onChange(updateLight);
    // gui.add(light, 'penumbra', 0, 1, 0.01);
    // 调整光源的 position 的时候，就 updateLight
    makeXYZGUI(gui, light.position, 'position');
    // makeXYZGUI(gui, light.target.position, 'target', updateLight);

    // gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
    // gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor');
    // gui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor');
    // gui.add(light, 'intensity', 0, 2, 0.01);

    // for 方向光：
    // gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
    // gui.add(light, 'intensity', 0, 2, 0.01);
    // gui.add(light.target.position, 'x', -10, 10);
    // gui.add(light.target.position, 'z', -10, 10);
    // gui.add(light.target.position, 'y', 0, 10);
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
    if (resizeRendererToDisplaySize(renderer)) {
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
