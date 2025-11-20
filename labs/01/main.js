import * as THREE from 'three';

// Base setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(innerWidth, innerHeight);
scene.background = new THREE.Color("#888888").convertSRGBToLinear();
document.body.appendChild(renderer.domElement);
document.body.style.margin = 0;

// Example object
const box = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({
        color: 'red'
    })
);
box.position.z = -10;


scene.add(box);

function animation() {
    //Base setup
    requestAnimationFrame(animation);
    renderer.render(scene, camera);

    // Example animation
    box.rotation.z += 0.01;
    box.rotation.y += 0.01;
}
animation()