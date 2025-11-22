import Experience from "../Experience"
import * as THREE from 'three';

export default class World {

    constructor() {
        this.experience = Experience.getInstance()
        this.scene = this.experience.scene


        //Test
        const axesHelper = new THREE.AxesHelper()
        this.scene.add(axesHelper)
    }
}