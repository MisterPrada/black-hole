import * as THREE from 'three'
import Experience from '../Experience.js'
import BlackHoleRenderVertexShader from '../Shaders/BlackHole/render_v.glsl'
import BlackHoleRenderFragmentShader from '../Shaders/BlackHole/render_f.glsl'

import BlackHoleBuffer1FragmentShader from '../Shaders/BlackHole/buffer1_f.glsl'
import BlackHoleBuffer1VertexShader from '../Shaders/BlackHole/buffer1_v.glsl'

import BlackHoleBuffer2FragmentShader from '../Shaders/BlackHole/buffer2_f.glsl'
import BlackHoleBuffer2VertexShader from '../Shaders/BlackHole/buffer2_v.glsl'

import BlackHoleBuffer3FragmentShader from '../Shaders/BlackHole/buffer3_f.glsl'
import BlackHoleBuffer3VertexShader from '../Shaders/BlackHole/buffer3_v.glsl'

import BlackHoleBuffer4FragmentShader from '../Shaders/BlackHole/buffer4_f.glsl'
import BlackHoleBuffer4VertexShader from '../Shaders/BlackHole/buffer4_v.glsl'
import gsap from "gsap";
import {vec3} from "three/nodes";

import { EffectComposer, RenderPass, BlurPass, KernelSize } from "postprocessing";
import { MathUtils } from "three";

export default class BlackHole {
    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.debug = this.experience.debug.panel
        this.renderer = this.experience.renderer.instance
        this.timeline = this.experience.timeline
        this.resources = this.experience.resources
        this.size = this.experience.sizes
        this.isMobile = this.experience.isMobile

        this.quality = 2

        this.animationENd = false;
        this.cursorHunter = new THREE.Vector3(0, 0)

        this.parameters = {
            position: new THREE.Vector3(0, 4.5, -4.7),
            scale: new THREE.Vector3(1, 1, 1),
            width: 20.0,
            height: 20.0,
            bufferWidth: this.size.width / this.quality,
            bufferHeight: this.size.height / this.quality,
        }


        this.ortoCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 300 );
        //this.ortoCamera.position.copy(new THREE.Vector3(0.0, -0.0, 10.0))
        this.bufferGeometry = new THREE.PlaneGeometry( 2, 2 );

        this.bufferQUAD = new THREE.Mesh(this.bufferGeometry, new THREE.MeshBasicMaterial({color: 0xff0000}))
        this.scene.add(this.bufferQUAD);

        this.setModel()
        this.setDebug()

        // this.composer = new EffectComposer(this.renderer);
        //
        // this.renderPass = new RenderPass(this.scene, this.ortoCamera);
        // this.composer.addPass(this.renderPass);
        //
        // this.blurPass = new BlurPass({
        //     kernelSize: KernelSize.HUGE,
        // });
        //
        // this.blurPass.resolution.height = 1080
        // this.blurPass.scale = 0.11
        //this.composer.addPass(this.blurPass);
    }

    createBuffer1() {

        this.noiseTexture = this.resources.items.noiseTexture
        this.noiseTexture.wrapS = THREE.RepeatWrapping
        this.noiseTexture.wrapT = THREE.RepeatWrapping


        this.organicTexture = this.resources.items.organicTexture
        this.organicTexture.wrapS = THREE.RepeatWrapping
        this.organicTexture.wrapT = THREE.RepeatWrapping

        // Create a render target texture
        this.buffer1_A = new THREE.WebGLRenderTarget(this.parameters.bufferWidth, this.parameters.bufferHeight, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            generateMipmaps: false, // No need
            //colorSpace: THREE.SRGBColorSpace,
            depthBuffer: false, // No need
            stencilBuffer: false, // No need
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
        });

        this.buffer1_B = new THREE.WebGLRenderTarget(this.parameters.bufferWidth, this.parameters.bufferHeight, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            generateMipmaps: false, // No need
            //colorSpace: THREE.SRGBColorSpace,
            depthBuffer: false, // No need
            stencilBuffer: false, // No need
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
        });


        this.buffer1_material = new THREE.ShaderMaterial( {
            //wireframe: true,
            //side: THREE.DoubleSide,
            //depthWrite: false,
            //depthTest: false,
            //vertexColors: true,
            //transparent: true,
            //blending: THREE.AdditiveBlending,
            uniforms:
                {
                    uTime: { value: 0 },
                    uResolution: { value: new THREE.Vector2(this.parameters.bufferWidth, this.parameters.bufferHeight) },
                    uBuffer1: { value: this.noiseTexture },
                    uBuffer2: { value: this.organicTexture },
                    uBuffer3: { value: null },
                    uBuffer4: { value: null },
                    uCameraPosition: { value: this.camera.instance.position },
                    uCameraZoom: { value: -10 },
                    uMouse: { value: new THREE.Vector4() },
                },
            vertexShader: BlackHoleBuffer1VertexShader,
            fragmentShader: BlackHoleBuffer1FragmentShader
        } );
    }

    createBuffer2() {

        // Create a render target texture
        this.buffer2_A = new THREE.WebGLRenderTarget(this.parameters.bufferWidth, this.parameters.bufferHeight, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            generateMipmaps: false, // No need
            //colorSpace: THREE.SRGBColorSpace,
            depthBuffer: false, // No need
            stencilBuffer: false, // No need
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
        });

        this.buffer2_B = new THREE.WebGLRenderTarget(this.parameters.bufferWidth, this.parameters.bufferHeight, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            generateMipmaps: false, // No need
            //colorSpace: THREE.SRGBColorSpace,
            depthBuffer: false, // No need
            stencilBuffer: false, // No need
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
        });


        this.buffer2_material = new THREE.ShaderMaterial( {
            //wireframe: true,
            //side: THREE.DoubleSide,
            //depthWrite: false,
            //depthTest: false,
            //vertexColors: true,
            //transparent: true,
            //blending: THREE.AdditiveBlending,
            uniforms:
                {
                    uTime: { value: 0 },
                    uResolution: { value: new THREE.Vector2(this.parameters.bufferWidth, this.parameters.bufferHeight) },
                    uBuffer1: { value: null },
                    uBuffer2: { value: null },
                    uBuffer3: { value: null },
                    uBuffer4: { value: null },
                },
            vertexShader: BlackHoleBuffer2VertexShader,
            fragmentShader: BlackHoleBuffer2FragmentShader
        } );
    }

    createBuffer3() {

        // Create a render target texture
        this.buffer3_A = new THREE.WebGLRenderTarget(this.parameters.bufferWidth, this.parameters.bufferHeight, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            generateMipmaps: false, // No need
            //colorSpace: THREE.SRGBColorSpace,
            depthBuffer: false, // No need
            stencilBuffer: false, // No need
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
        });

        this.buffer3_B = new THREE.WebGLRenderTarget(this.parameters.bufferWidth, this.parameters.bufferHeight, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            generateMipmaps: false, // No need
            //colorSpace: THREE.SRGBColorSpace,
            depthBuffer: false, // No need
            stencilBuffer: false, // No need
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
        });


        this.buffer3_material = new THREE.ShaderMaterial( {
            //wireframe: true,
            //side: THREE.DoubleSide,
            //depthWrite: false,
            //depthTest: false,
            //vertexColors: true,
            //transparent: true,
            //blending: THREE.AdditiveBlending,
            uniforms:
                {
                    uTime: { value: 0 },
                    uResolution: { value: new THREE.Vector2(this.parameters.bufferWidth, this.parameters.bufferHeight) },
                    uBuffer1: { value: null },
                    uBuffer2: { value: null },
                    uBuffer3: { value: null },
                    uBuffer4: { value: null },
                },
            vertexShader: BlackHoleBuffer3VertexShader,
            fragmentShader: BlackHoleBuffer3FragmentShader
        } );
    }

    createBuffer4() {

        // Create a render target texture
        this.buffer4_A = new THREE.WebGLRenderTarget(this.parameters.bufferWidth, this.parameters.bufferHeight, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            generateMipmaps: true, // No need
            //colorSpace: THREE.SRGBColorSpace,
            depthBuffer: false, // No need
            stencilBuffer: false, // No need
            format: THREE.RGBAFormat,
            type: THREE.HalfFloatType,
        });

        this.buffer4_B = new THREE.WebGLRenderTarget(this.parameters.bufferWidth, this.parameters.bufferHeight, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            generateMipmaps: true, // No need
            //colorSpace: THREE.SRGBColorSpace,
            depthBuffer: false, // No need
            stencilBuffer: false, // No need
            format: THREE.RGBAFormat,
            type: THREE.HalfFloatType,
        });


        this.buffer4_material = new THREE.ShaderMaterial( {
            //wireframe: true,
            //side: THREE.DoubleSide,
            //depthWrite: false,
            //depthTest: false,
            //vertexColors: true,
            //transparent: true,
            //blending: THREE.AdditiveBlending,
            uniforms:
                {
                    uTime: { value: 0 },
                    uResolution: { value: new THREE.Vector2(this.parameters.bufferWidth, this.parameters.bufferHeight) },
                    uBuffer1: { value: null },
                    uBuffer2: { value: null },
                    uBuffer3: { value: null },
                    uBuffer4: { value: null },
                },
            vertexShader: BlackHoleBuffer4VertexShader,
            fragmentShader: BlackHoleBuffer4FragmentShader
        } );
    }

    setModel() {
        this.createBuffer1()
        this.createBuffer2()
        this.createBuffer3()
        this.createBuffer4()

        this.geometry = new THREE.PlaneGeometry( this.parameters.width, this.parameters.height, 1, 1 );
        this.material = new THREE.ShaderMaterial( {
            //wireframe: true,
            //side: THREE.DoubleSide,
            //depthWrite: false,
            //depthTest: false,
            //vertexColors: true,
            //transparent: true,
            blending: THREE.AdditiveBlending,
            uniforms:
                {
                    uTime: { value: 0 },
                    uResolution: { value: new THREE.Vector2(this.parameters.bufferWidth, this.parameters.bufferHeight) },
                    uBuffer1: { value: null },
                    uBuffer2: { value: null },
                    uBuffer3: { value: null },
                    uBuffer4: { value: null },
                },
            vertexShader: BlackHoleRenderVertexShader,
            fragmentShader: BlackHoleRenderFragmentShader
        } );
        this.blackHole = new THREE.Mesh( this.geometry, this.material );
        this.blackHole.position.copy(this.parameters.position);
        this.blackHole.scale.copy(this.parameters.scale);

        this.scene.add(this.blackHole);

    }

    setScaleAnimation() {

    }

    resize()
    {
        this.parameters.bufferWidth = this.size.width / this.quality
        this.parameters.bufferHeight = this.size.height / this.quality

        this.material.uniforms.uResolution.value = new THREE.Vector2(this.parameters.bufferWidth, this.parameters.bufferHeight)
        this.buffer1_material.uniforms.uResolution.value = new THREE.Vector2(this.parameters.bufferWidth, this.parameters.bufferHeight)
        this.buffer2_material.uniforms.uResolution.value = new THREE.Vector2(this.parameters.bufferWidth, this.parameters.bufferHeight)
        this.buffer3_material.uniforms.uResolution.value = new THREE.Vector2(this.parameters.bufferWidth, this.parameters.bufferHeight)
        this.buffer4_material.uniforms.uResolution.value = new THREE.Vector2(this.parameters.bufferWidth, this.parameters.bufferHeight)


        this.buffer1_A.setSize(this.parameters.bufferWidth, this.parameters.bufferHeight)
        this.buffer1_B.setSize(this.parameters.bufferWidth, this.parameters.bufferHeight)
        this.buffer2_A.setSize(this.parameters.bufferWidth, this.parameters.bufferHeight)
        this.buffer2_B.setSize(this.parameters.bufferWidth, this.parameters.bufferHeight)
        this.buffer3_A.setSize(this.parameters.bufferWidth, this.parameters.bufferHeight)
        this.buffer3_B.setSize(this.parameters.bufferWidth, this.parameters.bufferHeight)
        this.buffer4_A.setSize(this.parameters.bufferWidth, this.parameters.bufferHeight)
        this.buffer4_B.setSize(this.parameters.bufferWidth, this.parameters.bufferHeight)
    }

    update() {
        let old1_A = this.buffer1_A;
        this.buffer1_A = this.buffer1_B;
        this.buffer1_B = old1_A;

        let old2_A = this.buffer2_A;
        this.buffer2_A = this.buffer2_B;
        this.buffer2_B = old2_A;

        let old3_A = this.buffer3_A;
        this.buffer3_A = this.buffer3_B;
        this.buffer3_B = old3_A;

        let old4_A = this.buffer4_A;
        this.buffer4_A = this.buffer4_B;
        this.buffer4_B = old4_A;

        if (this.time.elapsed > 6.5)
        {
            if( this.isMobile )
            {
                this.experience.cursor.x = -1;
                this.experience.cursor.y = 1;
            }

            this.cursorHunter.y = MathUtils.damp(this.cursorHunter.y , this.experience.cursor.y, 2., this.time.delta);
            this.buffer1_material.uniforms.uMouse.value = new THREE.Vector4(0.0, this.cursorHunter.y * 600 * 6 / this.quality, 0.0, 0)
        }

        this.time.elapsed *= 4.0;


        this.material.uniforms.uTime.value = this.time.elapsed
        this.buffer1_material.uniforms.uTime.value = this.time.elapsed
        this.buffer2_material.uniforms.uTime.value = this.time.elapsed
        this.buffer3_material.uniforms.uTime.value = this.time.elapsed
        this.buffer4_material.uniforms.uTime.value = this.time.elapsed
        this.blackHole.lookAt(this.camera.instance.position)

        this.renderer.setRenderTarget(this.buffer1_A);
        this.bufferQUAD.material = this.buffer1_material;
        this.renderer.render(this.scene, this.ortoCamera);

        this.renderer.setRenderTarget(this.buffer2_A);
        this.bufferQUAD.material = this.buffer2_material;
        this.renderer.render(this.scene, this.ortoCamera);

        this.renderer.setRenderTarget(this.buffer3_A);
        this.bufferQUAD.material = this.buffer3_material;
        this.renderer.render(this.scene, this.ortoCamera);

        this.renderer.setRenderTarget(this.buffer4_A);
        this.bufferQUAD.material = this.buffer4_material;
        this.renderer.render(this.scene, this.ortoCamera);

        this.renderer.setRenderTarget(null);
        this.bufferQUAD.material = this.material;
        this.renderer.render(this.scene, this.ortoCamera);

        //this.composer.render();

        this.buffer1_material.uniforms.uBuffer3.value = this.buffer1_A.texture;
        this.buffer2_material.uniforms.uBuffer1.value = this.buffer1_A.texture;
        this.buffer3_material.uniforms.uBuffer1.value = this.buffer2_A.texture;
        this.buffer4_material.uniforms.uBuffer1.value = this.buffer3_A.texture;

        this.material.uniforms.uBuffer1.value = this.buffer1_A.texture;
        this.material.uniforms.uBuffer4.value = this.buffer4_A.texture;

        this.buffer1_material.uniforms.uCameraPosition.value = this.camera.instance.position
        if( !this.isMobile )
        {
            this.buffer1_material.uniforms.uCameraZoom.value = this.camera.instance.position.distanceTo( this.camera.controls.target )
        }else{
            this.buffer1_material.uniforms.uCameraZoom.value = 10
        }
    }

    setDebug() {
        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder({
                title: 'Black Hole'
            })

            // add selection
            this.debugFolder.addBlade({
                view: 'list',
                label: 'Quality',
                options: [
                    {text: 'High', value: 1},
                    {text: 'Medium', value: 2},
                    {text: 'Low', value: 4},
                    {text: 'Pixel Art', value: 6},
                ],
                value: this.quality,
                onChange: (value) => {

                }
            }).on('change', (ev) => {
                this.quality = ev.value
                this.resize()
            })


        }
    }
}
