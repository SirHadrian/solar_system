varying vec2 vertexUV;
varying vec3 vertexPosition;
varying vec3 vertexNormal;

uniform float T;
uniform vec2 R;

#define FC gl_FragCoord

#define PI 3.14159265359
#define S(a, b, x) smoothstep(a, b, x)

// A cell size of 1. is equal with a space divizion.
#define CELL_SIZE 1.
// If the uv space is too big the lines will disappear.
// Increase the line size to make them appear.
#define LINE_SIZE 0.01

void main() {

  float intensity = pow(.7 - dot(vertexNormal, vec3(1., 0., 0.)), 2.);

  gl_FragColor = vec4(1., 0.6, .3, 1.0) * intensity;
}
