
varying vec3 vColor;
varying vec2 vUv; 
uniform vec2 uFade;

void main() {
    vec3 color = vec3(vColor);
    float fadeStart = 0.4;
    float maxFade = 0.;
    float alpha = 1.;
  
    alpha = smoothstep(uFade.x, uFade.y, vUv.x);
    gl_FragColor = vec4(color,alpha);
    if (gl_FragColor.a < 0.0001) discard;
}