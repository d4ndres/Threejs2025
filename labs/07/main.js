import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { UltraHDRLoader } from 'three/examples/jsm/loaders/UltraHDRLoader.js';
import RAPIER from '@dimforge/rapier3d';

/**
 * CLASE PARA MANEJAR LA FÍSICA
 * https://github.com/bobbyroe/physics-with-rapier-and-three/blob/variations/index.js
 */
class PhysicsWorld {
    constructor() {
        // Crear mundo de física con gravedad
        const gravity = { x: 0.0, y: -9.81, z: 0.0 };
        this.world = new RAPIER.World(gravity);
        this.objects = []; // Objetos que necesitan sincronización
    }

    // Crear suelo estático
    createGround() {
        const colliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0);
        this.world.createCollider(colliderDesc);
    }

    // Crear un objeto dinámico (cubo, esfera, etc)
    createDynamicObject(position, colliderDesc) {
        // Crear rigid body
        const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(position.x, position.y, position.z);
        const rigidBody = this.world.createRigidBody(rigidBodyDesc);
        
        // Crear collider y adjuntarlo al rigid body
        this.world.createCollider(colliderDesc, rigidBody);
        
        return rigidBody;
    }

    // Registrar objeto para actualización
    addObject(rigidBody, mesh) {
        this.objects.push({ rigidBody, mesh });
    }

    // Actualizar física y sincronizar con Three.js
    update() {
        this.world.step();
        
        // Sincronizar todos los objetos
        this.objects.forEach(obj => {
            const position = obj.rigidBody.translation();
            const rotation = obj.rigidBody.rotation();
            
            obj.mesh.position.set(position.x, position.y, position.z);
            obj.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        });
    }
}

/**
 * CLASE PRINCIPAL DE LA APLICACIÓN
 */
class App {
    constructor() {
        this.setupScene();
        this.setupLights();
        this.setupEnvironment();
        this.setupPhysics();
        this.createObjects();
        this.animate();
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color("#888888").convertSRGBToLinear();
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
        this.camera.position.set(3, 3, 3);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(innerWidth, innerHeight);
        document.body.appendChild(this.renderer.domElement);
        document.body.style.margin = 0;
        
        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        this.scene.add(directionalLight);
    }

    setupEnvironment() {
        const hdrLoader = new UltraHDRLoader();
        hdrLoader.load('/assets/hdr/city.jpg', (hdr) => {
            hdr.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.environment = hdr;
            this.scene.background = hdr;
        });
    }

    setupPhysics() {
        this.physics = new PhysicsWorld();
        this.physics.createGround();
        
        // Crear mesh visual del suelo
        const ground = new THREE.Mesh(
            new THREE.BoxGeometry(20, 0.2, 20),
            new THREE.MeshStandardMaterial({ color: '#444444' })
        );
        ground.position.y = -0.1;
        this.scene.add(ground);
    }

    createObjects() {
        // Crear un cubo que cae
        const cubeCollider = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5)
            .setRestitution(0.7); // Rebote
        
        const cubeBody = this.physics.createDynamicObject(
            { x: 0, y: 5, z: 0 },
            cubeCollider
        );
        
        const cubeMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({ color: '#ff6600' })
        );
        this.scene.add(cubeMesh);
        
        // Registrar para sincronización
        this.physics.addObject(cubeBody, cubeMesh);
    }

    animate = () => {
        this.controls.update();
        this.physics.update();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate);
    }
}

// Iniciar la aplicación
new App();