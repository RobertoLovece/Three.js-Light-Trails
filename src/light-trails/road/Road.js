import * as THREE from 'three';

import roadVert from './shader/roadVert.glsl'
import roadFrag from './shader/roadFrag.glsl'
import islandFrag from './shader/islandFrag.glsl'

export default class Road extends THREE.Mesh{
	// Side  = 0 center, = 1 right = -1 left
	constructor(side, isRoad, options) {

		super();

		this.uTime = new THREE.Uniform(0);
	
		let segments = 200;
		this.geometry = new THREE.PlaneBufferGeometry(
			isRoad ? options.roadWidth : options.islandWidth,
			options.length,
			20,
			segments
		);

		let uniforms = {
			uTravelLength: new THREE.Uniform(options.length),
			uColor: new THREE.Uniform(
				new THREE.Color(
					isRoad ? options.colors.roadColor : options.colors.islandColor
				)
			),
			uTime: this.uTime
		};

		if (isRoad) {
			uniforms = Object.assign(uniforms, {
				uLanes: new THREE.Uniform(options.lanesPerRoad),
				uBrokenLinesColor: new THREE.Uniform(
					new THREE.Color(options.colors.brokenLines)
				),
				uShoulderLinesColor: new THREE.Uniform(
					new THREE.Color(options.colors.shoulderLines)
				),
				uShoulderLinesWidthPercentage: new THREE.Uniform(
					options.shoulderLinesWidthPercentage
				),
				uBrokenLinesLengthPercentage: new THREE.Uniform(
					options.brokenLinesLengthPercentage
				),
				uBrokenLinesWidthPercentage: new THREE.Uniform(
					options.brokenLinesWidthPercentage
				)
			});
		}

		this.material = new THREE.ShaderMaterial({
			fragmentShader: isRoad ? roadFrag : islandFrag,
			vertexShader: roadVert,
			side: THREE.DoubleSide,
			uniforms: Object.assign(
				uniforms,
				options.distortion.uniforms
			)
		});

		this.material.onBeforeCompile = shader => {
			shader.vertexShader = shader.vertexShader.replace(
				"#include <getDistortion_vertex>",
				options.distortion.getDistortion
			);
		};

		this.rotation.x = -Math.PI / 2;

		// Push it half further away
		this.position.z = -options.length / 2;
		this.position.x +=
			(options.islandWidth / 2 + options.roadWidth / 2) * side;
	
	}

	update(time) {
		this.uTime.value = time;
	}
}