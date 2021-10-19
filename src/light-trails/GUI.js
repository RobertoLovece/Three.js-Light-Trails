import * as dat from 'three/examples/jsm/libs/dat.gui.module.js';

import { BLOOMPARAMS } from './config';

export function initGUI(bloomPass) {

    const gui = new dat.GUI();
    const bloomFolder = gui.addFolder('Bloom')

    bloomFolder.add(BLOOMPARAMS, "bloomStrength", 0, 2.0).onChange(function() {
        bloomPass.strength = BLOOMPARAMS.bloomStrength;
    });
    bloomFolder.add(BLOOMPARAMS, "bloomThreshold", 0, 1.0).onChange(function() {
        bloomPass.threshold = BLOOMPARAMS.bloomThreshold;
    });
    bloomFolder.add(BLOOMPARAMS, "bloomRadius", 0, 2.0).onChange(function() {
        bloomPass.radius = BLOOMPARAMS.bloomRadius;
    });

    gui.open();
}