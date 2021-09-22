import * as THREE from 'three';
import Road1 from './Road.js'

export default class App {
	constructor(container, options = {}) {
		// Init ThreeJS Basics
		this.options = options;

		if (this.options.distortion == null) {
			this.options.distortion = {
				uniforms: distortion_uniforms,
				getDistortion: distortion_vertex
			};
		}

		this.renderer = new THREE.WebGLRenderer({
			antialias: false
		});

		this.renderer.setSize(container.offsetWidth, container.offsetHeight, false);
		this.renderer.setPixelRatio(window.devicePixelRatio);
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
		this.road = new Road(this, options);

		this.fovTarget = options.fov;

		this.speedUpTarget = 0;
		this.speedUp = 0;
		this.timeOffset = 0;

		// Binds
		this.tick = this.tick.bind(this);
		this.init = this.init.bind(this);
		this.setSize = this.setSize.bind(this);
	}

	init() {
		this.road.init();

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

		this.road.update(time);

	}

	setSize(width, height, updateStyles) {
		this.renderer.setSize(width, height, updateStyles);
	}

	tick() {
		const delta = this.clock.getDelta();
		this.renderer.render(this.scene, this.camera);
		this.update(delta);
		requestAnimationFrame(this.tick);
	}
}

const distortion_uniforms = {
	uDistortionX: new THREE.Uniform(new THREE.Vector2(80, 3)),
	uDistortionY: new THREE.Uniform(new THREE.Vector2(-40, 2.5))
};

const distortion_vertex = `
#define PI 3.14159265358979
  uniform vec2 uDistortionX;
  uniform vec2 uDistortionY;

    float nsin(float val){
    return sin(val) * 0.5+0.5;
    }
  vec3 getDistortion(float progress){
        progress = clamp(progress, 0.,1.);
        float xAmp = uDistortionX.r;
        float xFreq = uDistortionX.g;
        float yAmp = uDistortionY.r;
        float yFreq = uDistortionY.g;
        return vec3( 
            xAmp * nsin(progress* PI * xFreq   - PI / 2. ) ,
            yAmp * nsin(progress * PI *yFreq - PI / 2.  ) ,
            0.
        );
    }
`;

function lerp(current, target, speed = 0.1, limit = 0.001) {
	let change = (target - current) * speed;
	if (Math.abs(change) < limit) {
		change = target - current;
	}
	return change;
}

class Road {
	constructor(webgl, options) {
		this.webgl = webgl;
		this.options = options;

		this.uTime = new THREE.Uniform(0);
	}

	// Side  = 0 center, = 1 right = -1 left
	createPlane(side, width, isRoad) {
		const options = this.options;
		let segments = 100;
		const geometry = new THREE.PlaneBufferGeometry(
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
		const material = new THREE.ShaderMaterial({
			fragmentShader: isRoad ? roadFragment : islandFragment,
			vertexShader: roadVertex,
			side: THREE.DoubleSide,
			uniforms: Object.assign(
				uniforms,
				options.distortion.uniforms
			)
		});

		material.onBeforeCompile = shader => {
			shader.vertexShader = shader.vertexShader.replace(
				"#include <getDistortion_vertex>",
				options.distortion.getDistortion
			);
		};
		const mesh = new THREE.Mesh(geometry, material);
		mesh.rotation.x = -Math.PI / 2;
		// Push it half further away
		mesh.position.z = -options.length / 2;
		mesh.position.x +=
			(this.options.islandWidth / 2 + options.roadWidth / 2) * side;
		this.webgl.scene.add(mesh);

		return mesh;
	}

	init() {
		this.leftRoadWay = this.createPlane(-1, this.options.roadWidth, true);
		this.rightRoadWay = this.createPlane(1, this.options.roadWidth, true);
		this.island = this.createPlane(0, this.options.islandWidth, false);
	}

	update(time) {
		this.uTime.value = time;
	}
}

const roadBaseFragment = `
    #define USE_FOG;
    varying vec2 vUv; 
    uniform vec3 uColor;
    uniform float uTime;
    #include <roadMarkings_vars>
    void main() {
        vec2 uv = vUv;
        vec3 color = vec3(uColor);
        
        #include <roadMarkings_fragment>

        gl_FragColor = vec4(color,1.);
    }
`;

const islandFragment = roadBaseFragment
	.replace("#include <roadMarkings_fragment>", "")
	.replace("#include <roadMarkings_vars>", "");

const roadMarkings_vars = `
    uniform float uLanes;
    uniform vec3 uBrokenLinesColor;
    uniform vec3 uShoulderLinesColor;
    uniform float uShoulderLinesWidthPercentage;
    uniform float uBrokenLinesWidthPercentage;
    uniform float uBrokenLinesLengthPercentage;
    highp float random(vec2 co)
    {
        highp float a = 12.9898;
        highp float b = 78.233;
        highp float c = 43758.5453;
        highp float dt= dot(co.xy ,vec2(a,b));
        highp float sn= mod(dt,3.14);
        return fract(sin(sn) * c);
    }
`;

const roadMarkings_fragment = `

        uv.y = mod(uv.y + uTime * 0.1,1.);
        float brokenLineWidth = 1. / uLanes * uBrokenLinesWidthPercentage;
        // How much % of the lane's space is empty
        float laneEmptySpace = 1. - uBrokenLinesLengthPercentage;

        // Horizontal * vertical offset
        float brokenLines = step(1.-brokenLineWidth * uLanes,fract(uv.x * uLanes)) * step(laneEmptySpace, fract(uv.y * 100.)) ;
        // Remove right-hand lines on the right-most lane
        brokenLines *= step(uv.x * uLanes,uLanes-1.);
        color = mix(color, uBrokenLinesColor, brokenLines);


        float shoulderLinesWidth = 1. / uLanes * uShoulderLinesWidthPercentage;
        float shoulderLines = step(1.-shoulderLinesWidth, uv.x) + step(uv.x, shoulderLinesWidth);
        color = mix(color, uBrokenLinesColor, shoulderLines);

        vec2 noiseFreq = vec2(4., 7000.);
        float roadNoise = random( floor(uv * noiseFreq)/noiseFreq ) * 0.02 - 0.01; 
        color += roadNoise;
`;

const roadFragment = roadBaseFragment
	.replace("#include <roadMarkings_fragment>", roadMarkings_fragment)
	.replace("#include <roadMarkings_vars>", roadMarkings_vars);

const roadVertex = `
#define USE_FOG;
uniform float uTime;

uniform float uTravelLength;

varying vec2 vUv; 
  #include <getDistortion_vertex>
void main() {
  vec3 transformed = position.xyz;

    vec3 distortion  = getDistortion((transformed.y + uTravelLength / 2.) / uTravelLength);
    transformed.x += distortion.x;
    transformed.z += distortion.y;
  transformed.y += -1.*distortion.z;  
  
  vec4 mvPosition = modelViewMatrix * vec4(transformed,1.);
  gl_Position = projectionMatrix * mvPosition;
  vUv = uv;

}`;

