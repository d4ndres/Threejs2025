import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Base setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    antialias: true
});
const controls = new OrbitControls(camera, renderer.domElement);
 
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
document.body.style.margin = 0;

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

//Models

const gltfLoader = new GLTFLoader();

gltfLoader.load(
    '/assets/models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
        console.log(gltf);
        
        // option 1: best
        // scene.add(gltf.scene);

        // option 2
        // for( const child of gltf.scene.children ){
        //     scene.add(child);
        // }

        // option 3
        // while(gltf.scene.children.length){
        //     scene.add(gltf.scene.children[0]);
        // }

        // option 4: best
        const children =  [...gltf.scene.children];
        for( const child of children ){
            scene.add(child);
        }
        console.log(children);
    }
)

// Thre Draco compressed model only work if you have the Draco directory
// You can get it from node_modules/three/examples/jsm/libs/draco
// you need to serve it with your server
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/assets/draco/');
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load(
    '/assets/models/Duck/glTF-Draco/Duck.gltf',
    (gltf) => {
        gltf.scene.position.set(2, 0, 0);
        scene.add(gltf.scene);
    }
)




const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ 
        color: 0x808080, 
        side: THREE.DoubleSide 
    })
);

floor.rotation.x = - Math.PI * 0.5;
scene.add(floor);

camera.position.set(0, 2, 5);
camera.lookAt(0, 0, 0);
controls.target.set(0, 0, 0);


function animation() {
    //Base setup
    requestAnimationFrame(animation);
    renderer.render(scene, camera);

    controls.update();
}
animation()