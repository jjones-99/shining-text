import "./style.css";
import * as THREE from "three";

// Query the DOM.
const app = document.querySelector<HTMLDivElement>("#app")!;
const canvas = document.querySelector<HTMLCanvasElement>("#three-canvas")!;
const canvasContainer = document.querySelector<HTMLDivElement>("#three-container")!;

// Get values.
const containerWidth = canvasContainer.offsetWidth;
const containerHeight = canvasContainer.offsetHeight;
const containerRatio = containerWidth / containerHeight;
const pixelRatio = window.devicePixelRatio;

// Set up three.js.
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize( containerWidth, containerHeight );
renderer.setPixelRatio(pixelRatio);

const camera = new THREE.PerspectiveCamera( 75, containerRatio , 0.1, 1000 );
camera.position.z = 6;

const geometry = new THREE.BoxGeometry(2, 2, 2, 3, 3, 3);

const material = new THREE.MeshBasicMaterial({
  color: 0xff0000,
});

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Render/animate three.js.
function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();