import App from './src/app.js';
import * as LIGHT from './src/light-trails/LightTrails.js';
import {initRoadConfig} from './src/light-trails/config.js'

require('normalize.css/normalize.css');
require("./src/index.css");

window.onload = function () {
    const container = document.getElementById('app');

    let roadConfig = initRoadConfig();
    LIGHT.test();

    const myApp = new App(container, roadConfig);
    myApp.init();
}
