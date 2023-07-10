import * as THREE from 'three';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 5;

  const scene = new THREE.Scene();

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  // NOT A GOOD EXAMPLE OF HOW TO MAKE A CUBE!
  // Only trying to make it clear most vertices are unique
  // 创建一个方块需要36个顶点，每个面2个三角形，每个三角形3个顶点，6个面=36个顶点。

  // 每个面由2个三角形组成，每个三角形3个顶点，总共6个，但是其中2个是完全一样的；同样的位置，同样的法线，和同样的uv。
  // 可以移除部分相同的点
  const vertices = [
    // front
    { pos: [-1, -1, 1], norm: [0, 0, 1], uv: [0, 0] }, // 0
    { pos: [1, -1, 1], norm: [0, 0, 1], uv: [1, 0] }, // 1
    { pos: [-1, 1, 1], norm: [0, 0, 1], uv: [0, 1] }, // 2

    // { pos: [-1, 1, 1], norm: [0, 0, 1], uv: [0, 1] },
    // { pos: [1, -1, 1], norm: [0, 0, 1], uv: [1, 0] },
    { pos: [1, 1, 1], norm: [0, 0, 1], uv: [1, 1] }, // 3
    // right
    { pos: [1, -1, 1], norm: [1, 0, 0], uv: [0, 0] }, // 4
    { pos: [1, -1, -1], norm: [1, 0, 0], uv: [1, 0] }, // 5

    // { pos: [1, 1, 1], norm: [1, 0, 0], uv: [0, 1] },
    // { pos: [1, -1, -1], norm: [1, 0, 0], uv: [1, 0] },
    { pos: [1, 1, 1], norm: [1, 0, 0], uv: [0, 1] }, // 6
    { pos: [1, 1, -1], norm: [1, 0, 0], uv: [1, 1] }, // 7
    // back
    { pos: [1, -1, -1], norm: [0, 0, -1], uv: [0, 0] }, // 8
    { pos: [-1, -1, -1], norm: [0, 0, -1], uv: [1, 0] }, // 9

    // { pos: [1, 1, -1], norm: [0, 0, -1], uv: [0, 1] },
    // { pos: [-1, -1, -1], norm: [0, 0, -1], uv: [1, 0] },
    { pos: [1, 1, -1], norm: [0, 0, -1], uv: [0, 1] }, // 10
    { pos: [-1, 1, -1], norm: [0, 0, -1], uv: [1, 1] }, // 11
    // left
    { pos: [-1, -1, -1], norm: [-1, 0, 0], uv: [0, 0] }, // 12
    { pos: [-1, -1, 1], norm: [-1, 0, 0], uv: [1, 0] }, // 13

    // { pos: [-1, 1, -1], norm: [-1, 0, 0], uv: [0, 1] },
    // { pos: [-1, -1, 1], norm: [-1, 0, 0], uv: [1, 0] },
    { pos: [-1, 1, -1], norm: [-1, 0, 0], uv: [0, 1] }, // 14
    { pos: [-1, 1, 1], norm: [-1, 0, 0], uv: [1, 1] }, // 15
    // top
    { pos: [1, 1, -1], norm: [0, 1, 0], uv: [0, 0] }, // 16
    { pos: [-1, 1, -1], norm: [0, 1, 0], uv: [1, 0] }, // 17

    // { pos: [1, 1, 1], norm: [0, 1, 0], uv: [0, 1] },
    // { pos: [-1, 1, -1], norm: [0, 1, 0], uv: [1, 0] },
    { pos: [1, 1, 1], norm: [0, 1, 0], uv: [0, 1] }, // 18
    { pos: [-1, 1, 1], norm: [0, 1, 0], uv: [1, 1] }, // 19
    // bottom
    { pos: [1, -1, 1], norm: [0, -1, 0], uv: [0, 0] }, // 20
    { pos: [-1, -1, 1], norm: [0, -1, 0], uv: [1, 0] }, // 21

    // { pos: [1, -1, -1], norm: [0, -1, 0], uv: [0, 1] },
    // { pos: [-1, -1, 1], norm: [0, -1, 0], uv: [1, 0] },
    { pos: [1, -1, -1], norm: [0, -1, 0], uv: [0, 1] }, // 22
    { pos: [-1, -1, -1], norm: [0, -1, 0], uv: [1, 1] }, // 23 现在我们有24个唯一的顶点。
  ];
  const positions = [];
  const normals = [];
  const uvs = [];
  for (const vertex of vertices) {
    positions.push(...vertex.pos);
    normals.push(...vertex.norm);
    uvs.push(...vertex.uv);
  }

  const geometry = new THREE.BufferGeometry();
  const positionNumComponents = 3;
  const normalNumComponents = 3;
  const uvNumComponents = 2;
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
      new Float32Array(positions), // 转换为 Float32Array 的类型数组TypedArrays
      positionNumComponents
    )
  );
  geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents)
  );
  geometry.setAttribute(
    'uv',
    new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents)
  );

  // 通过调用 BufferGeometry.setIndex 并传入索引数组来创建12个三角形。
  geometry.setIndex([
     0,  1,  2,   2,  1,  3,  // front
     4,  5,  6,   6,  5,  7,  // right
     8,  9, 10,  10,  9, 11,  // back
    12, 13, 14,  14, 13, 15,  // left
    16, 17, 18,  18, 17, 19,  // top
    20, 21, 22,  22, 21, 23,  // bottom
  ]);

  const loader = new THREE.TextureLoader();
  const texture = loader.load(
    'https://threejs.org/manual/examples/resources/images/star.png'
  );

  function makeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({ color, map: texture });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cube.position.x = x;
    return cube;
  }

  const cubes = [
    makeInstance(geometry, 0x88ff88, 0),
    makeInstance(geometry, 0x8888ff, -4),
    makeInstance(geometry, 0xff8888, 4),
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
