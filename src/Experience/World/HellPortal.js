import * as THREE from 'three'
import Experience from '../Experience.js'
import sunVertexShader from '../Shaders/HellPortal/vertex.glsl'
import sunFragmentShader from '../Shaders/HellPortal/fragment.glsl'
import gsap from "gsap";

export default class HellPortal {
    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.debug = this.experience.debug
        this.renderer = this.experience.renderer.instance
        this.timeline = this.experience.timeline

        this.parameters = {
            position: new THREE.Vector3(0, 4.5, -4.7),
            scale: new THREE.Vector3(1, 1, 1),
            width: 15.0,
            height: 15.0,
        }


        this.setModel()
        this.setDebug()
    }

    setModel() {
        this.geometry = new THREE.PlaneGeometry( this.parameters.width, this.parameters.height, 128, 128 );
        this.material = new THREE.ShaderMaterial( {
            //wireframe: true,
            //side: THREE.DoubleSide,
            //depthWrite: false,
            //depthTest: false,
            //vertexColors: true,
            transparent: true,
            //blending: THREE.AdditiveBlending,
            uniforms:
                {
                    uTime: { value: 0 },
                    uResolution: { value: new THREE.Vector2(128, 128) },
                },
            vertexShader: sunVertexShader,
            fragmentShader: sunFragmentShader
        } );
        this.hellPortal = new THREE.Mesh( this.geometry, this.material );
        this.hellPortal.position.copy(this.parameters.position);
        this.hellPortal.scale.copy(this.parameters.scale);

        this.scene.add(this.hellPortal);
    }

    setScaleAnimation() {

    }

    resize()
    {

    }

    update() {
        this.material.uniforms.uTime.value = this.time.elapsed
        this.hellPortal.lookAt(this.camera.instance.position)
    }

    setDebug() {
        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('HellPortal')
            this.debugFolder.add(this.hellPortal.position, 'x').min(-100).max(100).step(0.1).name('position x')
            this.debugFolder.add(this.hellPortal.position, 'y').min(-100).max(100).step(0.1).name('position y')
            this.debugFolder.add(this.hellPortal.position, 'z').min(-100).max(100).step(0.1).name('position z')

            this.debugFolder.add(this.hellPortal.scale, 'x').min(-100).max(100).step(0.1).name('scale x')
            this.debugFolder.add(this.hellPortal.scale, 'y').min(-100).max(100).step(0.1).name('scale y')
            this.debugFolder.add(this.hellPortal.scale, 'z').min(-100).max(100).step(0.1).name('scale z')
        }
    }
}
