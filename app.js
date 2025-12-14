// app.js (module) - Three.js hero + UI interactivity
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js';

document.getElementById('year').textContent = new Date().getFullYear();

// === THREE.JS SETUP ===
const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();

// subtle fog & background
scene.fog = new THREE.FogExp2(0x071022, 0.02);

// camera
const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.set(0, 0.8, 3);

// renderer
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;

// lights
const hemi = new THREE.HemisphereLight(0xffffff, 0x000020, 0.35);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(5, 5, 5);
dir.castShadow = true;
dir.shadow.radius = 4;
scene.add(dir);

// ground (subtle)
const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0x04141b, opacity: 0.0, transparent: true }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.2;
scene.add(ground);

// make a stylized 3D group (to mimic Figma 'floating' object)
const group = new THREE.Group();
scene.add(group);

// main body - rounded-ish with torus + box + sphere combo
const mat = new THREE.MeshStandardMaterial({
  color: 0x7c5cff,
  metalness: 0.25,
  roughness: 0.15,
  emissive: 0x0b0720,
  emissiveIntensity: 0.08
});
const core = new THREE.Mesh(new THREE.TorusKnotGeometry(0.45, 0.12, 120, 16), mat);
core.castShadow = true;
core.receiveShadow = true;
group.add(core);

// accent ring
const ringMat = new THREE.MeshStandardMaterial({
  color: 0x5ad1ff,
  metalness: 0.1,
  roughness: 0.2,
  emissive: 0x00242b,
  emissiveIntensity: 0.06
});
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.06, 16, 120), ringMat);
ring.rotation.x = Math.PI / 2 * 0.35;
group.add(ring);

// small floating spheres
for (let i = 0; i < 6; i++) {
  const sMat = new THREE.MeshStandardMaterial({ color: 0xffffff * Math.random(), roughness: 0.4, metalness: 0.6 });
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.06 + Math.random() * 0.06, 16, 12), sMat);
  s.position.set((Math.random() - 0.5) * 1.6, (Math.random() - 0.2) * 1.2, (Math.random() - 0.5) * 1.6);
  group.add(s);
}

// controls (subtle orbit)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableZoom = false;
controls.enableDamping = true;
controls.dampingFactor = 0.12;
controls.autoRotate = false;

// responsiveness
function resizeRendererToDisplaySize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== Math.floor(width * renderer.getPixelRatio()) || canvas.height !== Math.floor(height * renderer.getPixelRatio());
  if (needResize) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  return needResize;
}

let pointer = { x: 0, y: 0 };

// follow pointer for subtle parallax
window.addEventListener('pointermove', (e) => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
});

// animate
const clock = new THREE.Clock();
function animate() {
  if (resizeRendererToDisplaySize()) { /* size updated */ }

  const t = clock.getElapsedTime();

  // gentle idle animation
  group.rotation.y = Math.sin(t * 0.35) * 0.25;
  group.rotation.x = Math.cos(t * 0.12) * 0.07;

  // pointer influence (smooth)
  group.position.x += (pointer.x * 0.4 - group.position.x) * 0.08;
  group.position.y += (pointer.y * 0.35 - group.position.y) * 0.08;

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// detect WebGL support & show fallback on small devices or no-gl
function hasWebGL() {
  try {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!(window.WebGLRenderingContext && gl);
  } catch (e) {
    return false;
  }
}

function updateFallback() {
  const fallback = document.getElementById('fallback-cube');
  const threeCanvas = document.getElementById('three-canvas');
  // hide WebGL canvas on narrow screens or if no GL
  if (!hasWebGL() || window.innerWidth < 880) {
    threeCanvas.style.display = 'none';
    fallback.style.display = 'block';
  } else {
    threeCanvas.style.display = 'block';
    fallback.style.display = 'none';
  }
}
updateFallback();
window.addEventListener('resize', updateFallback);

// === Simple tilt effect for .tilt cards ===
document.querySelectorAll('.tilt').forEach(el => {
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -10;
    const ry = (px - 0.5) * 10;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
    el.style.boxShadow = `${-ry}px ${rx}px 30px rgba(2,6,23,0.45)`;
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; el.style.boxShadow = ''; });
  el.addEventListener('pointerdown', () => el.style.transform += ' scale(0.99)');
  el.addEventListener('pointerup', () => el.style.transform = '');
});

// keyboard focus accessible styles (visual only)
document.querySelectorAll('.card').forEach(c => {
  c.addEventListener('focus', () => c.style.transform = 'translateY(-6px)');
  c.addEventListener('blur', () => c.style.transform = '');
});
