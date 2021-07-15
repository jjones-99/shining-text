import "./style.css";
import * as THREE from "three";
// @ts-ignore
import vertexShader from "../shaders/vertex.glsl";
// @ts-ignore
import fragmentShader from "../shaders/fragment.glsl";

// ===== QUERY DOM
const canvas = document.querySelector<HTMLCanvasElement>("#three-canvas")!;
const canvasContainer = document.querySelector<HTMLDivElement>("#three-container")!;

// ===== SETUP constants
const PIXEL_RATIO = window.devicePixelRatio;
const MASK_URL = "./assets/the best.jpg";
const NOISE_URL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/noise.png";

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
const textureMask = textureLoader.load(MASK_URL);
const textureNoise = textureLoader.load(NOISE_URL);
textureNoise.wrapS = THREE.RepeatWrapping;
textureNoise.wrapT = THREE.RepeatWrapping;
textureNoise.minFilter = THREE.LinearFilter;

// ===== SHADER
const uniforms = {
  u_textureMask: {
    value: textureMask,
  },
  u_pxaspect: {
    value: PIXEL_RATIO,
  },
  u_resolution: {
    value: new THREE.Vector2(),
  },
  u_time: {
    value: 1.0,
  },
  u_mouse: {
    value: new THREE.Vector2(-0.1, -0.1),
  },
  u_noise: {
    value: textureNoise,
  },
};
uniforms.u_resolution.value.x = renderer.domElement.width;
uniforms.u_resolution.value.y = renderer.domElement.height;

// ===== CAMERA
const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
camera.position.z = 6;

// ===== GROUP
const mainGroup = new THREE.Group();
scene.add(mainGroup);

// ===== CUBE
const planeGeometry = new THREE.PlaneGeometry(20, 20);
const planeMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
mainGroup.add(plane);

// ===== Render/animate three.js.
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// ===== Mouse listener for rotation
document.addEventListener("pointermove", (ev) => {
  let ratio = window.innerHeight / window.innerWidth;
  uniforms.u_mouse.value.x = (ev.pageX - window.innerWidth / 2) / window.innerWidth / ratio;
  uniforms.u_mouse.value.y = ((ev.pageY - window.innerHeight / 2) / window.innerHeight) * -1;
  ev.preventDefault();
});

// ===== Handle window resize
window.onresize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.x = renderer.domElement.width;
  uniforms.u_resolution.value.y = renderer.domElement.height;
  camera.aspect = uniforms.u_resolution.value.x / uniforms.u_resolution.value.y;
  camera.updateProjectionMatrix();
};
