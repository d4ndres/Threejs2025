import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { UltraHDRLoader } from 'three/examples/jsm/loaders/UltraHDRLoader.js';
import RAPIER from '@dimforge/rapier3d';
console.log(RAPIER);

// Base setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(3, 3, 3);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

renderer.setSize(innerWidth, innerHeight);
scene.background = new THREE.Color("#888888").convertSRGBToLinear();
document.body.appendChild(renderer.domElement);
document.body.style.margin = 0;

// HDRI Environment Map
const hdrLoader = new UltraHDRLoader();
hdrLoader.load('/assets/hdr/city.jpg', (hdr) => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdr;
    scene.background = hdr;
})

// ===== PASO 1: CREAR EL MUNDO DE FÍSICA =====
// Definimos la gravedad (como en la Tierra: 9.81 m/s² hacia abajo)
const gravity = { x: 0.0, y: -9.81, z: 0.0 };
const world = new RAPIER.World(gravity);


// ===== PASO 2: CREAR UN SUELO ESTÁTICO =====
// Un "collider" sin rigid body = objeto estático (no se mueve)
const groundColliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0);
world.createCollider(groundColliderDesc);

// Mesh visual del suelo en Three.js
const ground = new THREE.Mesh(
    new THREE.BoxGeometry(20, 0.2, 20),
    new THREE.MeshStandardMaterial({ color: '#e00000ff' })
);
ground.position.y = -0.1;
scene.add(ground);


// ===== PASO 3: CREAR UN CUBO QUE CAE =====
// 3.1 - Crear el "rigid body" (cuerpo físico)
const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()  // "dynamic" = afectado por fuerzas
    .setTranslation(0, 5, 0);  // Posición inicial: arriba en el aire
const rigidBody = world.createRigidBody(rigidBodyDesc);

// 3.2 - Crear el "collider" (forma de colisión)
const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5)  // Medio tamaño (1x1x1)
    .setRestitution(0.7);  // Rebote (0 = no rebota, 1 = rebote perfecto)
world.createCollider(colliderDesc, rigidBody);

// 3.3 - Crear el mesh visual en Three.js
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: '#ff6600' })
);
scene.add(cube);


// Luces para ver mejor
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

function animation() {
    controls.update();
    
    // ===== PASO 4: ACTUALIZAR LA SIMULACIÓN DE FÍSICA =====
    world.step();  // Avanza la simulación física un frame
    
    // ===== PASO 5: SINCRONIZAR FÍSICA CON VISUALES =====
    // Obtener la posición del rigid body
    const position = rigidBody.translation();
    const rotation = rigidBody.rotation();
    
    // Actualizar el mesh de Three.js con la posición física
    cube.position.set(position.x, position.y, position.z);
    cube.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    
    renderer.render(scene, camera);
    requestAnimationFrame(animation);
}
animation()