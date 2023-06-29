import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'; // https://github.com/georgealways/lil-gui

// 目标：做一个太阳、地球和月亮的图
function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  const gui = new GUI();

  const fov = 40;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 50, 0); // 摄像头放在原点的正上方向下看
  camera.up.set(0, 0, 1); // 需要告诉摄像机的顶部朝向哪个方向，或者说哪个方向是摄像机的 "上"
  camera.lookAt(0, 0, 0); // 往上看原点
  // 对于大多数情况来说，正 Y 是向上的就足够了，但是由于我们是直视下方，我们需要告诉摄像机正 Z 是向上的。

  const scene = new THREE.Scene();

  {
    const color = 0xffffff;
    const intensity = 3;
    // 设置一个点光源，点光源代表从一个点向各个方向发射的光源，可以想成灯泡？💡
    const light = new THREE.PointLight(color, intensity);
    scene.add(light);
  }

  // 要更新旋转角度的对象数组
  const objects = [];

  // 一球多用
  const radius = 1;
  const widthSegments = 6; // 赤道周围只有 6 个分段。这是为了便于观察旋转情况
  const heightSegments = 6;
  // 低多边形球体（low-polygon sphere）
  const sphereGeometry = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments
  );

  const solarSystem = new THREE.Object3D();
  scene.add(solarSystem);
  objects.push(solarSystem);

  // 太阳 🌞
  const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffff00 });
  // emissive 放射属性，设为黄色。基本上不受其他光照影响的固有颜色。光照会被添加到该颜色上。
  const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
  sunMesh.scale.set(5, 5, 5); // 扩大太阳的大小
  // scene.add(sunMesh);
  solarSystem.add(sunMesh);
  objects.push(sunMesh);

  // 地球轨道
  const earthOrbit = new THREE.Object3D();
  earthOrbit.position.x = 10;
  solarSystem.add(earthOrbit);
  objects.push(earthOrbit);

  // 地球 🌍
  const earthMaterial = new THREE.MeshPhongMaterial({
    color: 0x2233ff,
    emissive: 0x112244, // 放射蓝（emissive blue）
  });
  const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
  // earthMesh.position.x = 10; // 将其定位在太阳的左边 10 个单位， // 注意，这个偏移量已经在它的父对象THREE.Object3D "earthOrbit "中设置了。
  // scene.add(earthMesh); // 这样只能把地球添加到场景中，地球不会睡着太阳转
  // sunMesh.add(earthMesh); // 把地球加入到 sunMesh 中，地球就会跟着太阳转
  // 但地球的 scale 会跟着太阳的 scale 一起变化，所以会变成地球和太阳一样大
  // 地球与太阳的距离也变成5x = 50。
  // 为了解决上面这个问题，需要添加一个空的场景图节点 solarSystem。我们将把太阳和地球都作为该节点的子节点
  // solarSystem.add(earthMesh);
  earthOrbit.add(earthMesh);
  objects.push(earthMesh);

  // 月亮轨道
  const moonOrbit = new THREE.Object3D();
  moonOrbit.position.x = 2;
  earthOrbit.add(moonOrbit);

  // 月亮 🌛
  const moonMaterial = new THREE.MeshPhongMaterial({
    color: 0x888888,
    emissive: 0x222222,
  });
  const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
  moonMesh.scale.set(0.5, 0.5, 0.5);
  moonOrbit.add(moonMesh);
  objects.push(moonMesh);

  // 为每个节点添加一个AxesHelper，会画了 3 条线，X Y Z轴，可以辅助画图
  // objects.forEach((node) => {
  //   const axes = new THREE.AxesHelper();
  //   axes.material.depthTest = false; // 这意味着它们不会检查其是否在其他东西后面进行绘制， 轴即使在球体内部也能出现
  //   axes.renderOrder = 1; // 这样它们就会在所有球体之后被绘制，否则球体可以在它们上面绘制就遮挡住了
  //   node.add(axes);
  // });
  // 由于我们是直视下方，而每个物体只是围绕 y 轴旋转，所以我们看不到y (绿色)轴。

  // 打开/关闭轴和网格的可见性
  // lil-gui 要求一个返回类型为bool型的属性
  // 来创建一个复选框，所以我们为 `visible`属性
  // 绑定了一个setter 和 getter。 从而让lil-gui
  // 去操作该属性.
  class AxisGridHelper {
    constructor(node, units = 10) {
      const axes = new THREE.AxesHelper();
      axes.material.depthTest = false;
      axes.renderOrder = 2; // 在网格渲染之后再渲染
      node.add(axes);

      const grid = new THREE.GridHelper(units, units);
      grid.material.depthTest = false;
      grid.renderOrder = 1;
      node.add(grid);

      this.grid = grid;
      this.axes = axes;
      this.visible = false;
    }
    get visible() {
      return this._visible;
    }
    set visible(v) {
      this._visible = v;
      this.grid.visible = v;
      this.axes.visible = v;
    }
  }

  // 为每个节点制作一个 GridHelper 和一个 AxesHelper。我们需要为每个节点添加一个标签
  // lil-gui 会自动地生成一个 UI 来操作某个对象的命名属性
  function makeAxisGrid(node, label, units) {
    const helper = new AxisGridHelper(node, units);
    gui.add(helper, 'visible').name(label);
  }

  makeAxisGrid(solarSystem, 'solarSystem', 25);
  makeAxisGrid(sunMesh, 'sunMesh');
  makeAxisGrid(earthOrbit, 'earthOrbit');
  makeAxisGrid(earthMesh, 'earthMesh');
  makeAxisGrid(moonOrbit, 'moonOrbit');
  makeAxisGrid(moonMesh, 'moonMesh');

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

    objects.forEach((obj) => {
      obj.rotation.y = time;
    });

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
