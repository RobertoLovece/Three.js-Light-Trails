import { initDistortion } from './distortion/Distortion.js';

const distortion = initDistortion();

export function initSceneConfig() {
    
    let sceneConfig = {
        fov: 90,
    };

    return sceneConfig;

}

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