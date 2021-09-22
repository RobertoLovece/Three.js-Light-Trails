import App from './app.js';

require('normalize.css/normalize.css');
require("./index.css");

window.onload = function () {
    const container = document.getElementById('app');

    const roadOptions = {

        length: 400,
        roadWidth: 9,
        islandWidth: 2,
        lanesPerRoad: 3,

        fov: 90,

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

    const myApp = new App(container, roadOptions);
    myApp.init();
}
