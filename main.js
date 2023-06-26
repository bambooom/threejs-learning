import * as THREE from 'three';

function main() {
  const canvas = document.querySelector('#c');
  // 创建一个WebGL渲染器, 渲染器负责将你提供的所有数据渲染绘制到canvas上
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const fov = 75; // 视野范围(field of view)的缩写，垂直方向为75度
  const aspect = 2; // 画布的宽高比，在默认情况下 画布是300x150像素，所以宽高比为300/150或者说2，也是相机默认值
  // near和far代表近平面和远平面，限制了摄像机面朝方向的可绘区域。 距离小于或超过这个范围的物体都将被裁剪掉(不绘制)。
  const near = 0.1; // 近平面
  const far = 5; // 远平面
  // 以上4个参数定义了一个 "视椎(frustum)"
  // 创建透视摄像机
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  // 摄像机默认指向Z轴负方向，上方向朝向Y轴正方向。我们将会把立方体放置在坐标原点，所以我们需要往后移一下摄像机才能显示出物体。
  camera.position.z = 2;

  // 创建一个场景
  const scene = new THREE.Scene();

  // 创建灯光
  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4); // 让它朝向坐标原点方向
    scene.add(light);
  }

  function makeCubeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({ color });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cube.position.x = x;
    return cube;
  }

  // 创建一个包含盒子信息的立方几何体(BoxGeometry)，包含了组成三维物体的顶点信息的几何体
  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  /** 创建多个 cubes **/
  const cubes = [
    makeCubeInstance(geometry, 0x44aa88, 0),
    makeCubeInstance(geometry, 0x8844aa, -2),
    makeCubeInstance(geometry, 0xaa8844, 2),
  ];

  /** 创建单个 cube **/
  // 创建一个基本的材质并设置它的颜色. 颜色的值可以用css方式和十六进制来表示。
  // const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 }); // MeshBasicMaterial材质不会受到灯光的影响
  // const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 }); // 换一种材质，会受灯光影响

  // 创建一个网格Mesh对象，包含了几何体和材质，以及对象在场景中相对于它父对象的位置、朝向、和缩放。
  // const cube = new THREE.Mesh(geometry, material);
  // 最后将网格添加到场景中
  // scene.add(cube);

  // 最终将场景和相机渲染到canvas上
  // renderer.render(scene, camera);
  /** 创建单个 cube, end **/

  // 为了让它动起来我们需要用到一个渲染循环函数 requestAnimationFrame
  function render(time) {
    time *= 0.001; // 将时间单位变为秒

    // cube.rotation.x = time;
    // cube.rotation.y = time;

    cubes.forEach((cube, idx) => {
      const speed = 1 + idx * 0.1;
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
