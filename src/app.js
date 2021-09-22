import * as THREE from 'three';
import Road from './light-trails/road/Road.js';

import {initDistortion} from './light-trails/distortion/distortion.js';

let leftRoadWay, rightRoadWay, island;

export default class App {
	constructor(container, options = {}) {
		// Init ThreeJS Basics
		this.options = options;


		this.options.distortion = initDistortion();

		this.renderer = new THREE.WebGLRenderer({
			antialias: false
		});

		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(container.offsetWidth, container.offsetHeight);
		container.append(this.renderer.domElement);

		this.camera = new THREE.PerspectiveCamera(
			options.fov,
			container.offsetWidth / container.offsetHeight,
			0.1,
			10000
		);

		this.camera.position.z = -5;
		this.camera.position.y = 8;
		this.camera.position.x = 0;

		this.scene = new THREE.Scene();

		this.clock = new THREE.Clock();
		this.disposed = false;

		// Create Objects

		this.fovTarget = options.fov;

		this.speedUpTarget = 0;
		this.speedUp = 0;
		this.timeOffset = 0;

		// Binds
		this.tick = this.tick.bind(this);
		this.init = this.init.bind(this);
	}

	init() {

		leftRoadWay = new Road(-1, true, this, this.options);
		rightRoadWay = new Road(1, true, this, this.options);
		island = new Road(0, false, this, this.options);

		this.tick();
	}
	
	update(delta) {
		let lerpPercentage = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);

		this.speedUp += lerp(
			this.speedUp,
			this.speedUpTarget,
			lerpPercentage,
			0.00001
		);

		this.timeOffset += this.speedUp * delta;

		let time = this.clock.elapsedTime + this.timeOffset;

		leftRoadWay.update(time);
		rightRoadWay.update(time);
		island.update(time);

	}

	tick() {
		const delta = this.clock.getDelta();
		this.renderer.render(this.scene, this.camera);
		this.update(delta);
		requestAnimationFrame(this.tick);
	}
}

function lerp(current, target, speed = 0.1, limit = 0.001) {
	let change = (target - current) * speed;
	if (Math.abs(change) < limit) {
		change = target - current;
	}
	return change;
}
