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
const MASK_URL = "./assets/jared.jpg";
// Photo by [Ivan Gromov](https://unsplash.com/@creativesuppliesco) of Unsplash.
// const BASE_URL = "./assets/ivan-gromov-Y3vPEuNlf7w-unsplash.jpg";
// Photo by [Marjan Blan](https://unsplash.com/@marjan_blan)
const BASE_URL = "./assets/marjan-blan-marjanblan-794QUz5-cso-unsplash.jpg"

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
const textureNoise: any = {}; //textureLoader.load(NOISE_URL);
textureNoise.wrapS = THREE.RepeatWrapping;
textureNoise.wrapT = THREE.RepeatWrapping;
textureNoise.minFilter = THREE.LinearFilter;
const textureBase = textureLoader.load(BASE_URL);
textureBase.wrapS = THREE.RepeatWrapping;
textureBase.wrapT = THREE.RepeatWrapping;
textureBase.minFilter = THREE.LinearFilter;

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
  u_textureNoise: {
    value: textureNoise,
  },
  u_textureBase: {
    value: textureBase,
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
