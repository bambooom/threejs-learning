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

  // 一个canvas的内部尺寸，它的分辨率，通常被叫做绘图缓冲区(drawingbuffer)尺寸。
  // 这个函数检查渲染器的 canvas 尺寸，是否和canvas 的显示尺寸不一样，如果不一样就设置更新
  // 如果一致，就最后不要设置相同的大小
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      // 默认会设置 canvas 的 css 尺寸，这是我们不想要的，所以需要在最后一个参数使用 false
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  /**
   * 如果一定想要使用设备的分辨率的话，用下面这种直接设置宽高的方法更好
   * 因为有很多种情况下我们需要知道canvas的绘图缓冲区的确切尺寸
   * 使用下面这个方法，在 HD-DPI 显示器上边角会更清晰
   */
  // function resizeRendererToDisplaySize(renderer) {
  //   const canvas = renderer.domElement;
  //   // 获取设备的 pixel ratio
  //   const pixelRatio = window.devicePixelRatio;
  //   // 然后直接相乘获取宽高，再设置
  //   const width = (canvas.clientWidth * pixelRatio) | 0;
  //   const height = (canvas.clientHeight * pixelRatio) | 0;
  //   const needResize = canvas.width !== width || canvas.height !== height;
  //   if (needResize) {
  //     renderer.setSize(width, height, false);
  //   }
  //   return needResize;
  // }

  // 为了让它动起来我们需要用到一个渲染循环函数 requestAnimationFrame
  function render(time) {
    time *= 0.001; // 将时间单位变为秒

    // 仅当canvas尺寸发生变化时去更新 camera 的宽高比
    if (resizeRendererToDisplaySize(renderer)) {
      // 当 canvas 没有固定 width/height，而是设置为响应式的时候
      // 如果不改变的话，cube 会被拉伸并出现不清晰的锯齿
      // 所以这里设置用 clientWidth/clientHeight 来设置 aspect 来解决
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      // 以上代码作用后，立方体不会被拉伸，保持正确的比例
    }
    // 使用以上的 block 之后，渲染的分辨率是和 canvas 的显示尺寸一样的，不会出现不清晰的锯齿了

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
