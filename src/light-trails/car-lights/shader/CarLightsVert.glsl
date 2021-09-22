attribute vec3 aOffset;
attribute vec3 aMetrics;
attribute vec3 aColor;

uniform float uTravelLength;
uniform float uTime;
uniform float uSpeed;

varying vec2 vUv; 
varying vec3 vColor; 
#include <getDistortion_vertex>

void main() {
    
    vec3 transformed = position.xyz;
    float radius = aMetrics.r;
    float myLength = aMetrics.g;
    float speed = aMetrics.b;

    transformed.xy *= radius ;
    transformed.z *= myLength;
  
    // Add my length to make sure it loops after the lights hits the end
    transformed.z += myLength-mod( uTime *speed + aOffset.z, uTravelLength);
    transformed.xy += aOffset.xy;


    float progress = abs(transformed.z / uTravelLength);
    transformed.xyz += getDistortion(progress);

    vec4 mvPosition = modelViewMatrix * vec4(transformed,1.);
    gl_Position = projectionMatrix * mvPosition;
    vUv = uv;
    vColor = aColor;
}