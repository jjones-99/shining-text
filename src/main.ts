import "./style.css";
import * as THREE from "three";
import gsap from "gsap";
// @ts-ignore
import vertexShader from "../shaders/vertex.glsl";
// @ts-ignore
import fragmentShader from "../shaders/fragment.glsl";

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

// ===== SHADER
const uniforms = {
  u_textureJared: {
    value: textureJared,
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
};

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
  if (ROTATE_WITH_MOUSE) {
    gsap.to(mainGroup.rotation, {
      y: -uniforms.u_mouse.value.y!,
      x: -uniforms.u_mouse.value.x!,
      duration: 2,
    });
  }
}
animate();

// ===== Mouse listener for rotation
document.addEventListener("pointermove", (ev) => {
  let ratio = window.innerHeight / window.innerWidth;
  uniforms.u_mouse.value.x = (ev.pageX - window.innerWidth / 2) / window.innerWidth / ratio;
  uniforms.u_mouse.value.y = ((ev.pageY - window.innerHeight / 2) / window.innerHeight) * -1;
});

// ===== Handle window resize
window.onresize = () => {
  containerWidth = canvasContainer.offsetWidth;
  containerHeight = canvasContainer.offsetHeight;
  renderer.setSize(containerWidth, containerHeight);
  camera.aspect = containerWidth / containerHeight;
  camera.updateProjectionMatrix();
};
