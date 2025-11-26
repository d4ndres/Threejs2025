import Experience from "../Experience";
import World from "./World";
import * as THREE from 'three'
import RAPIER  from '@dimforge/rapier3d';

class Particle {

    static id = 0

    constructor() {
        this.uid = Particle.id++
        this.world = World.getInstance()
        this.engineWorld = this.world.engineWorld
        this.size = 1 + (Math.random() * 2 - 1) * 0.5
        this.position = {
            x: (Math.random() * 2 - 1) * 20,
            y: (Math.random() * 2 - 1) * 20,
            z: (Math.random() * 2 - 1) * 20,
        }

        this.setVirtualBody()
        this.setGraphicMesh()
    }

    setVirtualBody() {
        this.rigidBody = this.engineWorld.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(
                    this.position.x,
                    this.position.y,
                    this.position.z,
                )
        )

        this.collider = RAPIER.ColliderDesc
            .ball(this.size)
            .setRestitution(0.5)

        this.engineWorld.createCollider(
            this.collider,
            this.rigidBody
        )
    }

    setGraphicMesh() {
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.size, 10, 10),
            new THREE.MeshStandardMaterial({
                color: '#4395e2',
                metalness: 0.3,
                roughness: 0.7
                // transparent: true,
                // opacity: 0.5
            })
        )
        this.mesh.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        )

        this.writeMesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.size, 10, 10),
            new THREE.MeshStandardMaterial({
                color: '#e24843',
                wireframe: true,
            })
        )

        this.mesh.add(this.writeMesh)
    }

    update() {
        const sceneMiddle = new THREE.Vector3(0, 0, 0);
    
        this.rigidBody.resetForces(true)
        const {x,y,z} = this.rigidBody.translation()
        let position = new THREE.Vector3(x, y, z)
        let direction = position.clone().sub(sceneMiddle).normalize()
        this.rigidBody.addForce(direction.multiplyScalar(-10), true);

        const quaternion = this.rigidBody.rotation();
        const rotation = new THREE.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);

        // const {x,y,z} = this.rigidBody.translation()
        // const rotation = this.rigidBody.rotation();
        
        this.mesh.position.set(x, y, z);
        this.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    }
}


export default class Watter {

    constructor() {
        this.experience = Experience.getInstance()
        this.scene = this.experience.scene
        this.length = 50
        this.particles = []
        this.initParticles()
    }

    initParticles() {
        this.particles = Array.from({ length: this.length }, () => {
            const p = new Particle()
            this.scene.add(p.mesh)
            return p
        })
        console.log(this)
    }


    update() {
        this.particles.forEach( particle => {
            particle.update()
        })
    }
}