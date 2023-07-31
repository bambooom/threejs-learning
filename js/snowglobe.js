// https://enlight.nyc/projects/snowglobe-threejs

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function main() {
  // set up scene, The scene is an object that will hold everything we create
  const scene = new THREE.Scene();
  // set scene's background color
  scene.background = new THREE.Color(0xbad4ff);

  // create camera
  const camera = new THREE.PerspectiveCamera(
    75, // field of view
    window.innerWidth / window.innerHeight, // aspect
    1, // near
    50 // far
  );

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // creating snow
  const flakeCount = 9000; // desired amount of snowflakes
  // generating a tetrahedron geometries (四面体) with a very small radius 0.035
  // note: 四面体不够精细，其实很容易看出来并不是 snowflake
  const flakeGeometry = new THREE.TetrahedronGeometry(0.035);
  const flakeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff }); // material color white
  const snow = new THREE.Group();

  for (let i = 0; i < flakeCount; i++) {
    const flakeMesh = new THREE.Mesh(flakeGeometry, flakeMaterial);
    // set random position for snowflake
    flakeMesh.position.set(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 40
    );
    snow.add(flakeMesh);
  }
  scene.add(snow);

  // set the variable flakeArray to snow.children so we can animate each one of them after.
  const flakeArray = snow.children;

  // creating surface
  const groundGeometry = new THREE.CircleGeometry(10, 50); // triangles
  const groundMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  // slightly below the level of the camera
  ground.position.y = -1.8;
  // To give the ground the right orientation, we can rotate it 90 degrees on it’s x axis, or pi/2 radians.
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // building Tree, consist of a trunk, and the three leaves in a cone shape
  const tree = new THREE.Group();
  // CylinderGeometry, 柱形体
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1);
  const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x49311c });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  tree.add(trunk);
  // add leaves for tree, ConeGeometry 锥体 模拟树叶
  const leavesGeometry = new THREE.ConeGeometry(1.2, 2, 6);
  const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x3d5e3a });
  const leavesBottom = new THREE.Mesh(leavesGeometry, leavesMaterial);
  leavesBottom.position.y = 1.2;
  tree.add(leavesBottom);
  const leavesMiddle = new THREE.Mesh(leavesGeometry, leavesMaterial);
  leavesMiddle.position.y = 2.2;
  tree.add(leavesMiddle);
  const leavesTop = new THREE.Mesh(leavesGeometry, leavesMaterial);
  leavesTop.position.y = 3.2;
  tree.add(leavesTop);

  tree.position.y = -1.3;
  scene.add(tree);

  // rendering the scene
  // set two PointLights where we will shine white light with an intensity of .3 on each side.
  const rightLight = new THREE.PointLight(0xffffff, 0.3, 0);
  rightLight.position.set(10, 20, 7);

  const leftLight = new THREE.PointLight(0xffffff, 0.3, 0);
  leftLight.position.set(-10, 20, 7);
  // have an AmbientLight which illuminates the whole scene equally with an intensity of .8
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(rightLight);
  scene.add(leftLight);
  scene.add(ambientLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  camera.position.z = 15;
  camera.position.y = 1;
  controls.update();

  // animation
  // FlakeArray is an array containing each individual snowflake
  // use for loops to loop from 0 to flakeArray.length/2
  // and another for loops for the rest half
  // use rotation.y/x/x to make each flake spin on three axes
  // with all in 1st loop spinning one direction, all in 2nd loop spinning opposite direction

  const animate = () => {
    requestAnimationFrame(animate);

    for (let i = 0; i < flakeArray.length / 2; i++) {
      flakeArray[i].rotation.y += 0.01;
      flakeArray[i].rotation.x += 0.02;
      flakeArray[i].rotation.z += 0.03;
      flakeArray[i].position.y -= 0.018; // make snow fall

      if (flakeArray[i].position.y < -4) {
        flakeArray[i].position.y += 10; // go up again to make it infinitely fall
      }
    }

    for (let i = flakeArray.length / 2; i < flakeArray.length; i++) {
      flakeArray[i].rotation.y -= 0.03;
      flakeArray[i].rotation.x -= 0.03;
      flakeArray[i].rotation.z -= 0.02;
      flakeArray[i].position.y -= 0.016; // make snow fall

      if (flakeArray[i].position.y < -4) {
        flakeArray[i].position.y += 9.5;
      }

      snow.rotation.y -= 0.0000002;
    }

    controls.update();

    renderer.render(scene, camera);
  }

  animate();
}

main();
