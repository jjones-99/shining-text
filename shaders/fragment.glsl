uniform vec2 u_resolution;
uniform float u_pxaspect;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_textureJared;

// varying vec2 vertexUV;

const float LIGHT_STRENGTH = 0.2;
const vec3 LIGHT_COLOR = vec3(1, 0, 0);
const vec3 FALLOFF_COLOR = vec3(0, 1, 0);
const vec3 BASE_COLOR = vec3(0, 0, 1);
const float EXPOSURE = .35;

float valueFromTexture(vec2 uv) {
  // uv += u_mouse * .1; // Moves the letters
  vec2 res = u_resolution / u_pxaspect;
  float aspect = res.x / res.y;
  return texture2D(u_textureJared, uv + .5, -1.).x;
}

float getOcclusion(vec2 lightpos, float openness, float distanceFromLight) {
  return (1. - smoothstep(0.0, LIGHT_STRENGTH, distanceFromLight)) * (1. - openness);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);

  float openness = valueFromTexture(uv);
  vec2 lightPos = u_mouse;
  float distanceFromLight = length(lightPos - uv);
  float occlusion = getOcclusion(lightPos, openness, distanceFromLight);

  vec3 color = vec3((occlusion));// * EXPOSURE * LIGHT_COLOR);

  gl_FragColor = vec4(color, 1);
}