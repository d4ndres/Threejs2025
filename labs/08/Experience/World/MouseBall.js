import Experience from "../Experience";
import World from "./World";
import * as THREE from 'three'
import RAPIER  from '@dimforge/rapier3d';


export default class MouseBall {


    constructor() {
        this.world = World.getInstance()
        this.engineWorld = this.world.engineWorld
        this.scene = this.world.scene
        this.size = 1
        this.position = {
            x: 0,
            y: 0,
            z: 0,
        }
        this.cursorPosition2d = new THREE.Vector2(0,0)
        this.initializeMouseEvents()
        this.setVirtualBody()
        this.setGraphicMesh()
    }

    initializeMouseEvents() {
        window.addEventListener('mousemove', (ev) => {
            this.cursorPosition2d.set(
                (ev.clientX/innerWidth) * 2 - 1, 
                -(ev.clientY / innerHeight) * 2 + 1
            )
            // this.handleRaycast()
        })
    }



    setVirtualBody() {
        this.rigidBody = this.engineWorld.createRigidBody(
            RAPIER.RigidBodyDesc.kinematicPositionBased()
                .setTranslation(
                    this.position.x,
                    this.position.y,
                    this.position.z,
                )
        )
        this.collider = RAPIER.ColliderDesc.ball(this.size)
        this.engineWorld.createCollider(
            this.collider,
            this.rigidBody
        )
    }


    setGraphicMesh() {


        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.size),
            new THREE.MeshStandardMaterial({
                color: '#ffffff',
                emissive: '#ffffff',
            })
        )
        this.light = new THREE.PointLight('#ffffff', 100, 10)
        this.mesh.add(this.light)

        this.mesh.position.set(0,0,0)
        this.scene.add(this.mesh)

    }

    update() {

    }
}