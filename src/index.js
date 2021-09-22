import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import Shape from './utilities/shape.js'

require('normalize.css/normalize.css');
require("./index.css");

let scene, camera, renderer;
let controls, container, shapes;

window.onload = function () {
    initScene();
    initObjects();
    initControls();
    animate();
}

function initScene() {

    scene = new THREE.Scene();

    container = document.getElementById('canvas');

    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera = new THREE.PerspectiveCamera(
        75,
        width / height,
        0.1,
        1000
    );

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(width, height);

    container.appendChild(renderer.domElement);

    camera.position.z = 5;

}

function initObjects() {

    shapes = [];

    shapes.push(
        new Shape(0, 0, 2)
    );

    shapes.forEach(function (shape) {
        scene.add(shape);
    });
}

function initControls() {

    controls = new OrbitControls(camera, renderer.domElement);

    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableRotate = true;

}

function animate() {
    requestAnimationFrame(animate);

    shapes.forEach(function (shape) {
        shape.update();
    });

    controls.update();

    renderer.render(scene, camera);
}

function onWindowResize() {
    container = document.getElementById('canvas');

    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(width, height);
}

window.addEventListener('resize', onWindowResize, false);