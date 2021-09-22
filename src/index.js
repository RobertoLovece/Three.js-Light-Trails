import * as THREE from 'three';

import App from './app.js';

require('normalize.css/normalize.css');
require("./index.css");

window.onload = function () {
    const container = document.getElementById('app');

    const options = {
        onSpeedUp: (ev) => {
        },
        onSlowDown: (ev) => {
        },
        // mountainDistortion || LongRaceDistortion || xyDistortion || turbulentDistortion || turbulentDistortionStill || deepDistortionStill || deepDistortion
        distortion: mountainDistortion,

        length: 400,
        roadWidth: 9,
        islandWidth: 2,
        lanesPerRoad: 3,

        fov: 90,
        fovSpeedUp: 150,
        speedUp: 2,
        carLightsFade: 0.4,

        totalSideLightSticks: 50,
        lightPairsPerRoadWay: 50,

        // Percentage of the lane's width
        shoulderLinesWidthPercentage: 0.05,
        brokenLinesWidthPercentage: 0.1,
        brokenLinesLengthPercentage: 0.5,

        /*** These ones have to be arrays of [min,max].  ***/
        lightStickWidth: [0.12, 0.5],
        lightStickHeight: [1.3, 1.7],

        movingAwaySpeed: [60, 80],
        movingCloserSpeed: [-120, -160],

        /****  Anything below can be either a number or an array of [min,max] ****/

        // Length of the lights. Best to be less than total length
        carLightsLength: [400 * 0.05, 400 * 0.15],
        // Radius of the tubes
        carLightsRadius: [0.05, 0.14],
        // Width is percentage of a lane. Numbers from 0 to 1
        carWidthPercentage: [0.3, 0.5],
        // How drunk the driver is.
        // carWidthPercentage's max + carShiftX's max -> Cannot go over 1. 
        // Or cars start going into other lanes 
        carShiftX: [-0.2, 0.2],
        // Self Explanatory
        carFloorSeparation: [0.05, 1],

        colors: {
            roadColor: 0x080808,
            islandColor: 0x0a0a0a,
            background: 0x000000,
            shoulderLines: 0x131318,
            brokenLines: 0x131318,
            /***  Only these colors can be an array ***/
            leftCars: [0xff102a, 0xEB383E, 0xff102a],
            rightCars: [0xdadafa, 0xBEBAE3, 0x8F97E4],
            sticks: 0xdadafa,
        }
    };

    const myApp = new App(container, options);
    myApp.init();
}


/**

    Here on top you can find the uniforms for each distortion. 

    // ShaderShaping funcitns
    https://thebookofshaders.com/05/
     Steps 
     1. Write getDistortion in GLSL
     2. Write custom uniforms for tweak parameters. Put them outside the object.
     3. Re-create the GLSl funcion in javascript to get camera paning

     Notes: 
     LookAtAmp AND lookAtOffset are hand tuned to get a good camera panning.
 */

const mountainUniforms = {
    // x, y, z
    uFreq: new THREE.Uniform(new THREE.Vector3(3, 6, 10)),
    uAmp: new THREE.Uniform(new THREE.Vector3(30, 30, 20))
};

let nsin = val => Math.sin(val) * 0.5 + 0.5;

let mountainDistortion = {
    uniforms: mountainUniforms,
    getDistortion: `
    
        uniform vec3 uAmp;
        uniform vec3 uFreq;
    
        #define PI 3.14159265358979
        
            float nsin(float val){
            return sin(val) * 0.5+0.5;
            }
        
        vec3 getDistortion(float progress){
    
                float movementProgressFix = 0.02;
                return vec3( 
                    cos(progress * PI * uFreq.x + uTime) * uAmp.x - cos(movementProgressFix * PI * uFreq.x + uTime) * uAmp.x,
                    nsin(progress * PI * uFreq.y + uTime) * uAmp.y - nsin(movementProgressFix * PI * uFreq.y + uTime) * uAmp.y,
                    nsin(progress * PI * uFreq.z + uTime) * uAmp.z - nsin(movementProgressFix * PI * uFreq.z + uTime) * uAmp.z
                );
            }
    `,
    getJS: (progress, time) => {
        let movementProgressFix = 0.02;

        let uFreq = mountainUniforms.uFreq.value;
        let uAmp = mountainUniforms.uAmp.value;

        let distortion = new THREE.Vector3(
            Math.cos(progress * Math.PI * uFreq.x + time) * uAmp.x -
            Math.cos(movementProgressFix * Math.PI * uFreq.x + time) * uAmp.x,
            nsin(progress * Math.PI * uFreq.y + time) * uAmp.y -
            nsin(movementProgressFix * Math.PI * uFreq.y + time) * uAmp.y,
            nsin(progress * Math.PI * uFreq.z + time) * uAmp.z -
            nsin(movementProgressFix * Math.PI * uFreq.z + time) * uAmp.z
        );

        let lookAtAmp = new THREE.Vector3(2, 2, 2);
        let lookAtOffset = new THREE.Vector3(0, 0, -5);
        return distortion.multiply(lookAtAmp).add(lookAtOffset);
    }
};
