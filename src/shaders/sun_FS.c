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

vec3 draw_grid(vec3 uv) {

  // Draw grid.
  vec3 lines = vec3(0.);
  if (mod(uv.x, CELL_SIZE) < LINE_SIZE)
    lines = vec3(.7);
  if (mod(uv.y, CELL_SIZE) < LINE_SIZE)
    lines = vec3(.7);
  if (mod(uv.z, CELL_SIZE) < LINE_SIZE)
    lines = vec3(.7);

  // Draw axes.
  if (abs(uv.x) < LINE_SIZE)
    lines.r = 1.;
  if (abs(uv.y) < LINE_SIZE)
    lines.g = 1.;
  if (abs(uv.z) < LINE_SIZE)
    lines.b = 1.;

  return lines;
}

float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 perm(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }

float noise(vec3 p) {
  vec3 a = floor(p);
  vec3 d = p - a;
  d = d * d * (3.0 - 2.0 * d);

  vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
  vec4 k1 = perm(b.xyxy);
  vec4 k2 = perm(k1.xyxy + b.zzww);

  vec4 c = k2 + a.zzzz;
  vec4 k3 = perm(c);
  vec4 k4 = perm(c + 1.0);

  vec4 o1 = fract(k3 * (1.0 / 41.0));
  vec4 o2 = fract(k4 * (1.0 / 41.0));

  vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
  vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

  return o4.y * d.y + o4.x * (1.0 - d.y);
}

vec3 brightnessToColor(float bright) {
  bright *= .25;

  return (vec3(bright, bright * bright, bright * bright * bright * bright) /
          .25) *
         .6;
}

void main() {

  vec3 uv = vertexPosition;

  vec3 color = vec3(0.);

  // Properties
  const float octaves = 5.;
  float lacunarity = 2.0;
  float gain = 0.5;

  // Initial values
  float amplitude = 0.5;
  float frequency = 1.;

  float noisy = 0.;

  // Loop of octaves
  for (float i = 0.; i < octaves; i += 1.) {
    noisy += amplitude * noise(frequency * uv + T * .5);
    frequency *= lacunarity;
    amplitude *= gain;
  }

  color = brightnessToColor(noisy * 5.);

  // color += draw_grid(uv);

  gl_FragColor = vec4(color, 1.);
}
