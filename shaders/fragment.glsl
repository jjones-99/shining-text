uniform vec2 u_resolution;
uniform float u_pxaspect;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_textureJared;

varying vec2 vertexUV;

vec2 resolution() {
  return u_resolution / u_pxaspect;
}

float valueFromTexture() {
  vec2 res = resolution();
  float aspect = res.x / res.y;
  return texture2D(u_textureJared, vertexUV, -1.).x;
}

void main() {
  float v = valueFromTexture();
  gl_FragColor = vec4(v, v, v, 1);
}