
import Experience from "../Experience";
import * as THREE from 'three'

export default class Environment {
    constructor() {
        this.experience = Experience.getInstance()
        this.scene = this.experience.scene
        // this.debug = this.experience.debug

        // if(this.debug.active) {
        //     this.debugFolder = this.debug.ui.addFolder('Envieronment')
        // }


        this.setSunLigth()
        this.setEnvironmentLight()
    }

    setSunLigth() {
        this.sunLight = new THREE.DirectionalLight('#ffffff', 4)
        this.sunLight.castShadow = true
        this.sunLight.shadow.camera.far = 15
        this.sunLight.shadow.mapSize.set(1024, 1024)
        this.sunLight.shadow.normalBias = 0.05
        this.sunLight.position.set(3.5,2,-1.25) 
        this.scene.add(this.sunLight)

        // if(this.debug.active) {
        //     this.debugFolder.add(this.sunLight.position, 'x')
        //     .name('Sum light X')
        //     .min(-5)
        //     .max(5)
        //     .step(0.01)

        //     this.debugFolder.add(this.sunLight.position, 'z')
        //     .name('Sum light Z')
        //     .min(-5)
        //     .max(5)
        //     .step(0.01)
            
        //     this.debugFolder.add(this.sunLight, 'intensity')
        //     .name('Sum light')
        //     .min(0)
        //     .max(10)
        //     .step(0.01)

        // }
    }

    setEnvironmentLight() {
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
        this.scene.add(ambientLight);
    }

}