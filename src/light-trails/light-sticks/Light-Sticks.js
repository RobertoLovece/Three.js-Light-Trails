import * as THREE from 'three';

//

import lightSticksVert from './shader/LightSticksVert.glsl';
import lightSticksFrag from './shader/LightSticksFrag.glsl';

//

export default class LightSticks extends THREE.Mesh {
    constructor(options) {

        super();

        var plane = new THREE.PlaneBufferGeometry(1, 1);
        this.geometry = new THREE.InstancedBufferGeometry().copy(plane);

        let totalSticks = options.totalSideLightSticks;
        this.geometry.instanceCount = totalSticks;

        let stickoffset = options.length / (totalSticks - 1);
        const aOffset = [];
        const aColor = [];
        const aMetrics = [];

        let colors = options.colors.sticks;
        if (Array.isArray(colors)) {
            colors = colors.map(c => new THREE.Color(c));
        } else {
            colors = new THREE.Color(colors);
        }

        for (let i = 0; i < totalSticks; i++) {

            let width = this.random(options.lightStickWidth);
            let height = this.random(options.lightStickHeight);

            aOffset.push((i - 1) * stickoffset * 2 + stickoffset * Math.random());

            let color = this.pickRandom(colors);

            aColor.push(color.r);
            aColor.push(color.g);
            aColor.push(color.b);

            aMetrics.push(width);
            aMetrics.push(height);
        }

        this.geometry.setAttribute(
            "aOffset",
            new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 1, false)
        );

        this.geometry.setAttribute(
            "aColor",
            new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false)
        );

        this.geometry.setAttribute(
            "aMetrics",
            new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2, false)
        );

        this.material = new THREE.ShaderMaterial({
            fragmentShader: lightSticksFrag,
            vertexShader: lightSticksVert,
            // This ones actually need double side
            side: THREE.DoubleSide,
            uniforms: Object.assign(
                {
                    uTravelLength: new THREE.Uniform(options.length),
                    uTime: new THREE.Uniform(0)
                },
                options.distortion.uniforms
            )
        });

        this.material.onBeforeCompile = shader => {
            shader.vertexShader = shader.vertexShader.replace(
                "#include <getDistortion_vertex>",
                options.distortion.getDistortion
            );
        };

        this.frustumCulled = false;
    }

    //

    update(time) {
        this.material.uniforms.uTime.value = time;
    }

    //

    random(base) {
        if (Array.isArray(base)) return Math.random() * (base[1] - base[0]) + base[0];
        return Math.random() * base;
    };

    //

    pickRandom(arr) {
        if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)];
        return arr;
    };

    //
};