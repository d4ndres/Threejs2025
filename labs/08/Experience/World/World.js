import Experience from "../Experience"
import * as THREE from 'three';
import Watter from "./Watter";
import Environment from "./Environment";
import RAPIER from '@dimforge/rapier3d';


export default class World {
    static instance

    static getInstance() {
        return World.instance
    }

    constructor() {
        if(this.instance) {
            return this.instance
        }
        World.instance = this


        this.experience = Experience.getInstance()
        this.scene = this.experience.scene
        this.environment = new Environment()
        
        this.gravity = { x: 0.0, y: 0, z: 0.0 };
        this.engineWorld = new RAPIER.World(this.gravity);
        this.watter = new Watter()

        //Test
        const axesHelper = new THREE.AxesHelper()
        this.scene.add(axesHelper)
    }

    update() {
        // advance the physics simulation
        this.engineWorld.step()

        // then update visuals
        this.watter.update()
    }
}