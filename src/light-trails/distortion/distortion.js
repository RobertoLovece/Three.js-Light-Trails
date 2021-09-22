import { Uniform, Vector2 } from "three";

export function initDistortion() {
    var distortion_uniforms = {
        uDistortionX: new Uniform(new Vector2(80, 3)),
	    uDistortionY: new Uniform(new Vector2(-40, 2.5))
    };

    const distortion_vertex = `
    #define PI 3.14159265358979
    uniform vec2 uDistortionX;
    uniform vec2 uDistortionY;

    float nsin(float val){
        return sin(val) * 0.5+0.5;
    }
  
    vec3 getDistortion(float progress){
        progress = clamp(progress, 0.,1.);
        float xAmp = uDistortionX.r;
        float xFreq = uDistortionX.g;
        float yAmp = uDistortionY.r;
        float yFreq = uDistortionY.g;
        
        return vec3( 
            xAmp * nsin(progress* PI * xFreq   - PI / 2. ) ,
            yAmp * nsin(progress * PI *yFreq - PI / 2.  ) ,
            0.
        );
    }`;

    const myCustomDistortion = {
        uniforms: distortion_uniforms,
        getDistortion: distortion_vertex
    };

    return myCustomDistortion;

}