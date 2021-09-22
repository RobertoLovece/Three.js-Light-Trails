import { initDistortion } from './distortion/Distortion.js';

//

const distortion = initDistortion();

//

export function initSceneConfig() {

    let sceneConfig = {
        fov: 90,
    };

    return sceneConfig;

}

//

export function initRoadConfig() {

    let roadConfig = {

        distortion: distortion,

        length: 400,
        roadWidth: 9,
        islandWidth: 2,
        lanesPerRoad: 3,

        // Percentage of the lane's width
        shoulderLinesWidthPercentage: 0.05,
        brokenLinesWidthPercentage: 0.1,
        brokenLinesLengthPercentage: 0.5,

        colors: {
            roadColor: 0x080808,
            islandColor: 0x0a0a0a,
            background: 0x000000,
            shoulderLines: 0x131318,
            brokenLines: 0x131318,
        }
    };

    return roadConfig;
}

//

export function initCarLightsConfig() {

    let carLightsConfig = {
        distortion: distortion,

        length: 400,
        roadWidth: 9,
        lanesPerRoad: 3,
        carLightsFade: 0.4,

        lightPairsPerRoadWay: 50,

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

        movingAwaySpeed: [60, 80],
		movingCloserSpeed: [-120, -160],

        colors: {
            /***  Only these colors can be an array ***/
            leftCars: [0xff102a, 0xEB383E, 0xff102a],
            rightCars: [0xdadafa, 0xBEBAE3, 0x8F97E4],
        }

    }

    return carLightsConfig;
}