import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

//

import * as CONFIG from './config.js';
import Road from './road/Road.js';
import CarLights from './car-lights/CarLights.js';
import LightSticks from './light-sticks/Light-Sticks.js';

//

// scene related (these variables should be in index) 
let renderer, camera, scene, composer;

// objects
let leftRoadWay, rightRoadWay, island; // road
let leftCarLights, rightCarLights; // car lights
let leftSticks; // light sticks


// general (these variables should be in index) 
let clock, stats;

//

export function init() {

    initScene();
    initGeneral();
    initPostProcessing();
    initObjects();

};

//

function initScene() {

    var sceneConfig = CONFIG.initSceneConfig();

    renderer = new THREE.WebGLRenderer({
        antialias: false
    });

    var container = document.getElementById('canvas');

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.offsetWidth, container.offsetHeight);

    container.append(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        sceneConfig.fov,
        container.offsetWidth / container.offsetHeight,
        0.1,
        10000
    );

    camera.position.x = 0;
    camera.position.y = 8;
    camera.position.z = -5;

    var roadConfig = CONFIG.initRoadConfig();

    let fog = new THREE.Fog(
        0x000000,
        roadConfig.length * 0.2,
        roadConfig.length * 500,
    );
      
    scene.fog = fog;

}

//

function initPostProcessing() {

    var exposure = 1;
    renderer.toneMappingExposure = Math.pow(exposure, 4.0);

    composer = new EffectComposer(renderer);

    var renderPass = new RenderPass(scene, camera);

    // resolution, strength, radius, threshold
    var bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
	bloomPass.strength = 0.8;
    bloomPass.threshold = 0.1;
	bloomPass.radius = 1;

    var smaaPass = new SMAAPass( window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio() );

    renderPass.renderToScreen = false;
    bloomPass.renderToScreen = false;
    smaaPass.renderToScreen = true;

    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    composer.addPass(smaaPass);

}

//

function initObjects() {

    // road setup
    var roadConfig = CONFIG.initRoadConfig();

    leftRoadWay = new Road(-1, true, roadConfig);
    rightRoadWay = new Road(1, true, roadConfig);
    island = new Road(0, false, roadConfig);

    scene.add(leftRoadWay, rightRoadWay, island);


    // car lights setup
    var carLightsConfig = CONFIG.initCarLightsConfig();

    leftCarLights = new CarLights(
        carLightsConfig,
        carLightsConfig.colors.leftCars,
        carLightsConfig.movingAwaySpeed,
        new THREE.Vector2(0, 1 - carLightsConfig.carLightsFade)
    );

    leftCarLights.position.setX(
        -roadConfig.roadWidth / 2 - roadConfig.islandWidth / 2
    );

    //

    rightCarLights = new CarLights(
        carLightsConfig,
        carLightsConfig.colors.rightCars,
        carLightsConfig.movingCloserSpeed,
        new THREE.Vector2(1, 0 + carLightsConfig.carLightsFade)
    );
    rightCarLights.position.setX(
        roadConfig.roadWidth / 2 + roadConfig.islandWidth / 2
    );

    scene.add(leftCarLights, rightCarLights);


    // left sticks 
    var lightSticksConfig = CONFIG.initLightSticksConfig();

    leftSticks = new LightSticks(lightSticksConfig);
    leftSticks.position.setX(
        -(roadConfig.roadWidth + roadConfig.islandWidth / 2)
    );

    scene.add(leftSticks);

};

//

function initGeneral() {

    clock = new THREE.Clock();

    stats = new Stats();
    document.body.appendChild(stats.dom);

}

//

export function animate() {

    requestAnimationFrame(animate);

    let delta = clock.getDelta();

    update(delta);
    stats.update();

    // renderer.render();
    composer.render();

}

//

function update(delta) {

    var speedUpTarget = 0;
    var speedUp = 0;
    var timeOffset = 0;

    let lerpPercentage = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);

    speedUp += lerp(speedUp, speedUpTarget, lerpPercentage, 0.00001);

    timeOffset += speedUp * delta;

    let time = clock.elapsedTime + timeOffset;

    leftRoadWay.update(time);
    rightRoadWay.update(time);
    island.update(time);

    //

    leftCarLights.update(time);
    rightCarLights.update(time);

    //

    leftSticks.update(time);

}

//

function lerp(current, target, speed = 0.1, limit = 0.001) {
    let change = (target - current) * speed;
    if (Math.abs(change) < limit) {
        change = target - current;
    }
    return change;
}

//

function onWindowResize() {
    var container = document.getElementById('canvas');

    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    composer.setPixelRatio(window.devicePixelRatio);
    composer.setSize(width, height);
}

window.addEventListener('resize', onWindowResize, false);
