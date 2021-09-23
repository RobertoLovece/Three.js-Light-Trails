import * as LIGHT from './src/light-trails/main.js';

//

require('normalize.css/normalize.css');
require("./src/css/index.css");

//

window.onload = function () {
    
    LIGHT.init();
    LIGHT.animate();

}

//
