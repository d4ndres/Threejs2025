import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { UltraHDRLoader } from 'three/examples/jsm/loaders/UltraHDRLoader.js';
import RAPIER from '@dimforge/rapier3d';
console.log(RAPIER);

// Base setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(4, 4, 4);

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


// Raycaster
const raycaster = new THREE.Raycaster()
const cursorPosition2d = new THREE.Vector2(0,0)
const cursorPosition3d = new THREE.Vector3(0,0,0)

window.addEventListener('mousemove', (ev) => {
    cursorPosition2d.set(
        (ev.clientX/innerWidth) * 2 - 1, 
        -(ev.clientY / innerHeight) * 2 + 1)
})

const mousePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(20,20,20,20),
    new THREE.MeshBasicMaterial({
        color: '#ffffff',
        wireframe: true,
        transparent: true,
        opacity: 0.05,
    })
)
mousePlane.position.set(0,0,0.7)
mousePlane.rotation.x = - Math.PI * 0.5;
mousePlane.position.y = 0.5
scene.add(mousePlane)

function handleRaycast() {
    raycaster.setFromCamera(cursorPosition2d, camera)
    const intersects = raycaster.intersectObjects(
        [mousePlane],
        false
    )
    if(intersects.length) {
        cursorPosition3d.copy(intersects[0].point)
        console.log(cursorPosition3d)
    }

}

// Cursor3d
const cursorMeshRadio = 0.25

const virtualBody = RAPIER.RigidBodyDesc
    .kinematicPositionBased()
    .setTranslation(0,0,0)
const virtualCursor = world.createRigidBody(virtualBody)
const dynamicCursorCollider = RAPIER.ColliderDesc.ball(cursorMeshRadio * 2)
world.createCollider(dynamicCursorCollider, virtualCursor)


const cursorMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(cursorMeshRadio, 8),
    new THREE.MeshStandardMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.8,
    })
)
cursorMesh.update = (position3d) => {
    virtualCursor.setTranslation({
        x: position3d.x,
        y: position3d.y,
        z: position3d.z,
    })
    const { x, y, z} = virtualCursor.translation()
    cursorMesh.position.set(x, y, z)
}
cursorMesh.position.set(0,3,0)
scene.add(cursorMesh)



// ===== PASO 2: CREAR UN SUELO ESTÁTICO =====
// Un "collider" sin rigid body = objeto estático (no se mueve)
const groundColliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0);
world.createCollider(groundColliderDesc);

// Mesh visual del suelo en Three.js
const ground = new THREE.Mesh(
    new THREE.BoxGeometry(20, 0.2, 20),
    new THREE.MeshStandardMaterial({ color: '#3b3b3b' })
);
ground.position.y = -0.1;
scene.add(ground);


// ===== PASO 3: CREAR UN CUBO QUE CAE =====
// 3.1 - Crear el "rigid body" (cuerpo físico)
const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()  // "dynamic" = afectado por fuerzas
    .setTranslation(0, 5, 0);  // Posición inicial: arriba en el aire
const rigidBody = world.createRigidBody(rigidBodyDesc);

// 3.2 - Crear el "collider" (forma de colisión)
const colliderDesc = RAPIER.ColliderDesc
    .cuboid(0.5, 0.5, 0.5)  // Medio tamaño (1x1x1)
    .setRestitution(0.7)  // Rebote (0 = no rebota, 1 = rebote perfecto)
    // .setDensity(0.5)

world.createCollider(colliderDesc, rigidBody);

// 3.3 - Crear el mesh visual en Three.js
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: '#ff6600' })
);
cube.update = () => {
    const position = rigidBody.translation();
    const rotation = rigidBody.rotation();
    
    // Actualizar el mesh de Three.js con la posición física
    cube.position.set(position.x, position.y, position.z);
    cube.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    
}
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
    
    // Raycas
    handleRaycast()
    cursorMesh.update(cursorPosition3d)

    // ===== PASO 5: SINCRONIZAR FÍSICA CON VISUALES =====
    // Obtener la posición del rigid body
    cube.update()

    renderer.render(scene, camera);
    requestAnimationFrame(animation);
}
animation()