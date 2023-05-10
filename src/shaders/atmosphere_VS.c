varying vec2 vertexUV;
varying vec3 vertexPosition;
varying vec3 vertexNormal;

void main() {

  vertexUV = uv;
  vertexNormal = normal;
  vertexPosition = position;

  gl_Position =
      projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
