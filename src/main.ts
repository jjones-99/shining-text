import "./style.css";
import * as THREE from "three";
import gsap from "gsap";

// ===== QUERY DOM
const canvas = document.querySelector<HTMLCanvasElement>("#three-canvas")!;
const canvasContainer = document.querySelector<HTMLDivElement>("#three-container")!;

// ===== SETUP constants
const containerWidth = canvasContainer.offsetWidth;
const containerHeight = canvasContainer.offsetHeight;
const containerRatio = containerWidth / containerHeight;
const pixelRatio = window.devicePixelRatio;
const mouse: { x?: number; y?: number } = { x: undefined, y: undefined };

// ===== SETUP variables

// ===== SETUP three.js
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(containerWidth, containerHeight);
renderer.setPixelRatio(pixelRatio);

// ===== CAMERA
const camera = new THREE.PerspectiveCamera(75, containerRatio, 0.1, 1000);
camera.position.z = 6;

// ===== GROUP
const mainGroup = new THREE.Group();
scene.add(mainGroup);

// ===== CUBE
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2, 3, 3, 3);
const cubeMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
mainGroup.add(cube);

// ===== Render/animate three.js.
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  gsap.to(mainGroup.rotation, {
    y: mouse.y!,
    x: -mouse.x!,
    duration: 2,
  });
}
animate();

// ===== Mouse listener for rotation
addEventListener("mousemove", (ev) => {
  mouse.y = (ev.clientX / innerWidth) * 2 - 1;
  mouse.x = -(ev.clientY / innerHeight) * 2 + 1;
});
