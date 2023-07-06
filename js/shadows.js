import * as THREE from 'three';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const fov = 45;
  const aspect = 2;
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('white');

  // 使用相同的棋盘格地面
  const loader = new THREE.TextureLoader();

  {
    const planeSize = 40;
    const texture = loader.load(
      'https://threejs.org/manual/examples/resources/images/checker.png'
    );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    // 使用 MeshBasicMaterial, 不需要地面照明
    const planeMat = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    planeMat.color.setRGB(1.5, 1.5, 1.5); // 棋盘纹理的颜色倍增 1.5，1.5，1.5
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -0.5;
    scene.add(mesh);
  }

  // 加载阴影贴图
  const shadowTexture = loader.load(
    'https://threejs.org/manual/examples/resources/images/roundshadow.png'
  );
  // 创建一个数组来存放每个球体和它相关的对象
  const sphereShadowBases = [];
  {
    const sphereRadius = 1;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry(
      sphereRadius,
      sphereWidthDivisions,
      sphereHeightDivisions
    );
    // 创建一个假阴影的平面网格
    const planeSize = 1;
    const shadowGeo = new THREE.PlaneGeometry(planeSize, planeSize);

    // 创建一些球体，对于每个球体都将创建一个基础的THREE.Object3D，并且我们将同时创建阴影平面网格和球体网格
    // 这样，同时移动球体，阴影将一并移动，只需要将阴影稍微放置在地面上，防止z轴阴影和地面重叠
    // 阴影的材质是MeshBasicMaterial，所以它并不需要照明
    const numSpheres = 15;
    for (let i = 0; i < numSpheres; i++) {
      // 基础的THREE.Object3D，这样阴影和球体可以同时移动
      const base = new THREE.Object3D();
      scene.add(base);

      // 给基础object 创建阴影
      // note: we make a new material for each sphere，
      // so we can set that sphere's material transparency separately.
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true, // 透明, 就可以看到 ground 地面
        depthWrite: false, // so we don't have to sort, 使阴影之间不会彼此混淆
      });
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.position.y = 0.001; // 在地面上面一点点
      shadowMesh.rotation.x = Math.PI * -0.5;
      const shadowSize = sphereRadius * 4;
      shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
      base.add(shadowMesh);

      // 给基础object 创建球体
      const u = i / numSpheres;
      const sphereMat = new THREE.MeshPhongMaterial();
      sphereMat.color.setHSL(u, 1, 0.75);
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.set(0, sphereRadius + 2, 0);
      base.add(sphereMesh);

      // 设置不同的 position
      sphereShadowBases.push({
        base,
        sphereMesh,
        shadowMesh,
        y: sphereMesh.position.y,
      })
    }
  }

  // 设置光源，没有设置光源以前，所有的球体都是黑色，看不到颜色。设置之后会比较明亮
  {
    const skyColor = 0xb1e1ff; // light blue
    const groundColor = 0xb97a20; // brownish orange
    const intensity = 0.25;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }
  // 再设置一个 DirectionalLight, 让球体看起来有些视觉的区别
  {
    const color = 0xffffff;
    const intensity = 0.75;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 5);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
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

  function render(time) {
    time *= 0.001; // convert to seconds

    resizeRendererToDisplaySize(renderer);

    {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    // 设置球体动画, 对于每个球体，阴影以及 base，让它们在 XZ 平面上移动
    sphereShadowBases.forEach((sphereShadowBase, ndx) => {
      const { base, sphereMesh, shadowMesh, y } = sphereShadowBase;

      // u is a value that goes from 0 to 1 as we iterate the spheres
      const u = ndx / sphereShadowBases.length;

      // compute a position for there base. This will move
      // both the sphere and its shadow
      const speed = time * 0.2;
      const angle = speed + u * Math.PI * 2 * (ndx % 1 ? 1 : -1);
      const radius = Math.sin(speed - ndx) * 10;
      base.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

      // yOff is a value that goes from 0 to 1
      const yOff = Math.abs(Math.sin(time * 2 + ndx));
      // move the sphere up and down 将球体上下移动，类似球体在弹跳
      sphereMesh.position.y = y + THREE.MathUtils.lerp(-2, 2, yOff);
      // fade the shadow as the sphere goes up
      // 阴影材质的不透明度，与球体的高度相关。高度越高，阴影越模糊
      shadowMesh.material.opacity = THREE.MathUtils.lerp(1, 0.25, yOff);
    });

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
