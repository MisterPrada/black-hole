import { ShaderMaterial } from 'three';
export class ExtendedShaderMaterial extends ShaderMaterial {

	constructor( ...args ) {

		super( ...args );
		[
			'opacity',
			'map',
			'emissiveMap',
			'roughnessMap',
			'metalnessMap',
		].forEach( key => {

			Object.defineProperty( this, key, {

				get() {

					if ( ! ( key in this.uniforms ) ) return undefined;
					return this.uniforms[ key ].value;

				},

				set( v ) {

					if ( ! ( key in this.uniforms ) ) return;
					this.uniforms[ key ].value = v;

				}

			} );


		} );

	}

}
