import "./style.css";
import * as THREE from "three";
import gsap from "gsap";

// ===== QUERY DOM
const canvas = document.querySelector<HTMLCanvasElement>("#three-canvas")!;
const canvasContainer = document.querySelector<HTMLDivElement>("#three-container")!;

// ===== SETUP constants
const ROTATE_WITH_MOUSE = false;
const PIXEL_RATIO = window.devicePixelRatio;
const mouse: { x?: number; y?: number } = { x: undefined, y: undefined };

// ===== SETUP variables
let containerWidth = canvasContainer.offsetWidth;
let containerHeight = canvasContainer.offsetHeight;

// ===== SETUP three.js
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(containerWidth, containerHeight);
renderer.setPixelRatio(PIXEL_RATIO);

// ===== LOAD textures
const textureLoader = new THREE.TextureLoader();
const textureJared = textureLoader.load("./assets/jared.jpg");

// ===== CAMERA
const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
camera.position.z = 6;

// ===== GROUP
const mainGroup = new THREE.Group();
scene.add(mainGroup);

// ===== CUBE
const planeGeometry = new THREE.PlaneGeometry(2, 2);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  map: textureJared,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
mainGroup.add(plane);

// ===== Render/animate three.js.
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  if (ROTATE_WITH_MOUSE) {
    gsap.to(mainGroup.rotation, {
      y: mouse.y!,
      x: -mouse.x!,
      duration: 2,
    });
  }
}
animate();

// ===== Mouse listener for rotation
addEventListener("mousemove", (ev) => {
  mouse.y = (ev.clientX / innerWidth) * 2 - 1;
  mouse.x = -(ev.clientY / innerHeight) * 2 + 1;
});

// ===== Handle window resize
window.onresize = () => {
  containerWidth = canvasContainer.offsetWidth;
  containerHeight = canvasContainer.offsetHeight;
  renderer.setSize(containerWidth, containerHeight);
  camera.aspect = containerWidth / containerHeight;
  camera.updateProjectionMatrix();
};
