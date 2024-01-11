import * as THREE from 'three'

export class RendererState {

	constructor() {

		this.clearAlpha = 0;
		this.clearColor = new THREE.Color();
		this.renderTarget = null;
		this.outputColorSpace = THREE.SRGBColorSpace
		this.overrideMaterial = null;
		this.shadowsEnabled = false;

		this.autoClear = true;
		this.autoClearColor = true;
		this.autoClearDepth = true;
		this.autoClearStencil = true;

		this.background = null;
		this.autoUpdate = true;

	}

	copy( renderer, scene ) {

		if ( renderer ) {

			this.clearAlpha = renderer.getClearAlpha();
			this.clearColor = renderer.getClearColor( this.clearColor );
			this.renderTarget = renderer.getRenderTarget();

			this.shadowsEnabled = renderer.shadowMap.enabled;
			this.outputColorSpace = renderer.outputColorSpace;
			this.autoClear = renderer.autoClear;
			this.autoClearColor = renderer.autoClearColor;
			this.autoClearDepth = renderer.autoClearDepth;
			this.autoClearStencil = renderer.autoClearStencil;

		}

		if ( scene ) {

			this.overrideMaterial = scene.overrideMaterial;
			this.background = scene.background;
			this.autoUpdate = scene.autoUpdate;

		}

	}

	restore( renderer, scene ) {

		if ( renderer ) {

			renderer.setClearAlpha( this.clearAlpha );
			renderer.setClearColor( this.clearColor );
			renderer.setRenderTarget( this.renderTarget );

			renderer.shadowMap.enabled = this.shadowsEnabled;
			renderer.outputColorSpace = this.outputColorSpace;
			renderer.autoClear = this.autoClear;
			renderer.autoClearColor = this.autoClearColor;
			renderer.autoClearDepth = this.autoClearDepth;
			renderer.autoClearStencil = this.autoClearStencil;

		}

		if ( scene ) {

			scene.overrideMaterial = this.overrideMaterial;
			scene.background = this.background;
			scene.autoUpdate = this.autoUpdate;

		}

		this.renderTarget = null;
		this.overrideMaterial = null;

	}

}
