import * as THREE from 'three';

//

import carLightsVert from './shader/CarLightsVert.glsl';
import carLightsFrag from './shader/CarLightsFrag.glsl';

//

export default class CarLights extends THREE.Mesh {
	constructor(options, colors, speed, fade) {
		
        super();

		this.speed = speed;
		this.fade = fade;

		// Curve with length 1
		let curve = new THREE.LineCurve3(
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, 0, -1)
		);

		// Tube with radius = 1
		var tube = new THREE.TubeBufferGeometry(curve, 40, 1, 8, false);

		this.geometry = new THREE.InstancedBufferGeometry().copy(tube);
		this.geometry.instanceCount = options.lightPairsPerRoadWay * 2;

		let laneWidth = options.roadWidth / options.lanesPerRoad;

		let aOffset = [];
		let aMetrics = [];
		let aColor = [];

		if (Array.isArray(colors)) {
			colors = colors.map(c => new THREE.Color(c));
		} else {
			colors = new THREE.Color(colors);
		}

		for (let i = 0; i < options.lightPairsPerRoadWay; i++) {
            
			let radius = this.random(options.carLightsRadius);
			let length = this.random(options.carLightsLength);
			let speed = this.random(this.speed);

			let carLane = i % 3;
			let laneX = carLane * laneWidth - options.roadWidth / 2 + laneWidth / 2;

			let carWidth = this.random(options.carWidthPercentage) * laneWidth;
			let carShiftX = this.random(options.carShiftX) * laneWidth;
			// Both lights share same shiftX and lane;
			laneX += carShiftX;

			let offsetY = this.random(options.carFloorSeparation) + radius * 1.3;

			let offsetZ = -this.random(options.length);

			aOffset.push(laneX - carWidth / 2);
			aOffset.push(offsetY);
			aOffset.push(offsetZ);

			aOffset.push(laneX + carWidth / 2);
			aOffset.push(offsetY);
			aOffset.push(offsetZ);

			aMetrics.push(radius);
			aMetrics.push(length);
			aMetrics.push(speed);

			aMetrics.push(radius);
			aMetrics.push(length);
			aMetrics.push(speed);

			let color = this.pickRandom(colors);
			aColor.push(color.r);
			aColor.push(color.g);
			aColor.push(color.b);

			aColor.push(color.r);
			aColor.push(color.g);
			aColor.push(color.b);
		}

		this.geometry.setAttribute(
			"aOffset",
			new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 3, false)
		);

		this.geometry.setAttribute(
			"aMetrics",
			new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 3, false)
		);

		this.geometry.setAttribute(
			"aColor",
			new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false)
		);
		
        this.material = new THREE.ShaderMaterial({
			fragmentShader: carLightsFrag,
			vertexShader: carLightsVert,
			transparent: true,
			uniforms: Object.assign(
				{
					// uColor: new THREE.Uniform(new THREE.Color(this.color)),
					uTime: new THREE.Uniform(0),
					uTravelLength: new THREE.Uniform(options.length),
					uFade: new THREE.Uniform(this.fade)
				},
				options.distortion.uniforms
			)
		});
		
        this.material.onBeforeCompile = shader => {
			shader.vertexShader = shader.vertexShader.replace(
				"#include <getDistortion_vertex>",
				options.distortion.getDistortion
			);
		};

		this.frustumCulled = false;

	};

    //

	update(time) {
		this.material.uniforms.uTime.value = time;
	};

    //

    random(base){
        if (Array.isArray(base)) return Math.random() * (base[1] - base[0]) + base[0];
        return Math.random() * base;
    };

    //

    pickRandom(arr) {
        if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)];
        return arr;
    };

    //

};