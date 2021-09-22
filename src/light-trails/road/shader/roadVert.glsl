#include <getDistortion_vertex>

uniform float uTime;
uniform float uTravelLength;
varying vec2 vUv; 

void main(){
    
    vec3 transformed = position.xyz;

    float progress = (transformed.y + uTravelLength / 2.) / uTravelLength;
    vec3 distortion  = getDistortion(progress);
    transformed.x += distortion.x;
    transformed.z += distortion.y;

    vec4 mvPosition = modelViewMatrix * vec4(transformed,1.);
    gl_Position = projectionMatrix * mvPosition;
    vUv = uv;

}