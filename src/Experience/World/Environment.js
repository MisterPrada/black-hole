import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Environment
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        this.scene.colorSpace = THREE.SRGBColorSpace

        //this.scene.background = new THREE.Color('#00ff00')

        this.setAmbientLight()

        this.setDebug()
    }

    setAmbientLight() {
        this.ambientLight = new THREE.AmbientLight('#ffffff', .85)
        this.scene.add(this.ambientLight)
    }


    setEnvironmentMap()
    {

    }

    setDebug() {
        if(this.debug.active) {

        }
    }
}
