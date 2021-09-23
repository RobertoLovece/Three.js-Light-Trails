import * as LIGHT from './src/light-trails/main.js';

//

require('normalize.css/normalize.css');
require("./src/css/index.css");

//
// long term scene, renderer etc should move to here which would probably lead to light-trails/map becoming a class

window.onload = function () {
    
    LIGHT.init();
    LIGHT.animate();

}

//
