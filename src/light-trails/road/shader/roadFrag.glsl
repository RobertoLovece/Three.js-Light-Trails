
varying vec2 vUv; 
uniform vec3 uColor;
uniform float uTime;

// #include <roadMarkings_vars>
uniform float uLanes;
uniform vec3 uBrokenLinesColor;
uniform vec3 uShoulderLinesColor;
uniform float uShoulderLinesWidthPercentage;
uniform float uBrokenLinesWidthPercentage;
uniform float uBrokenLinesLengthPercentage;

highp float random(vec2 co) {
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

void main() {
    vec2 uv = vUv;
    vec3 color = vec3(uColor);
        
    // #include <roadMarkings_fragment>
    uv.y = mod(uv.y + uTime * 0.1,1.);
    float brokenLineWidth = 1. / uLanes * uBrokenLinesWidthPercentage;

    // How much % of the lane's space is empty
    float laneEmptySpace = 1. - uBrokenLinesLengthPercentage;

    // Horizontal * vertical offset
    float brokenLines = step(1.-brokenLineWidth * uLanes,fract(uv.x * uLanes)) * step(laneEmptySpace, fract(uv.y * 100.)) ;
    
    // Remove right-hand lines on the right-most lane
    brokenLines *= step(uv.x * uLanes,uLanes-1.);
    color = mix(color, uBrokenLinesColor, brokenLines);
    float shoulderLinesWidth = 1. / uLanes * uShoulderLinesWidthPercentage;
    float shoulderLines = step(1.-shoulderLinesWidth, uv.x) + step(uv.x, shoulderLinesWidth);
    color = mix(color, uBrokenLinesColor, shoulderLines);
    vec2 noiseFreq = vec2(4., 7000.);
    float roadNoise = random( floor(uv * noiseFreq)/noiseFreq ) * 0.02 - 0.01; 
    color += roadNoise;

    gl_FragColor = vec4(color,1.);

}