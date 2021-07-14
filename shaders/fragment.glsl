uniform vec2 u_resolution;
uniform float u_pxaspect;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_textureJared;

// varying vec2 vertexUV;

const float LIGHT_STRENGTH = 0.5;
const vec3 LIGHT_COLOR = vec3(1.5, 1.6, .6);
const vec3 FALLOFF_COLOR = vec3(.0, 1.0, 2.3);
const vec3 BASE_COLOR = vec3(.0, 0.25, .25);
const float EXPOSURE = .35;
const int SAMPLES = 12;
const float DENSITY = .98;
const float WEIGHT = 1.;
const float DECAY = .96;

// TODO: Other way of doing this?
float random2d(vec2 uv) {
  uv /= 256.;
  vec4 tex = texture2D(u_noise, uv);
  return mix(tex.x, tex.y, tex.a);
}

float valueFromTexture(vec2 uv) {
  // uv += u_mouse * .1; // Moves the letters
  vec2 res = u_resolution / u_pxaspect;
  float aspect = res.x / res.y;
  return texture2D(u_textureJared, uv + .5, -1.).x;
}

float getOcclusion(float openness, float distanceFromLight) {
  return (1. - smoothstep(0.0, LIGHT_STRENGTH, distanceFromLight)) * (1. - openness);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);

  float openness = valueFromTexture(uv);
  vec2 lightPos = u_mouse;
  float distanceFromLight = length(lightPos - uv);
  float occlusion = getOcclusion(openness, distanceFromLight);
  float lightStrengthFalling = 1.;

  vec2 dtc = (uv - lightPos) * (1. / float(SAMPLES) * DENSITY);
  for(int i = 0; i < SAMPLES; i++) {
    float dither = random2d(uv * 512. + mod(vec2(movement*sin(u_time * .5), -movement), 1000.)) * 2.;
    float offsetOcclusion = getOcclusion(valueFromTexture(uv - (dtc * (float(i)))), distanceFromLight) * lightStrengthFalling * WEIGHT;
    lightStrengthFalling *= DECAY;
    occlusion += offsetOcclusion;
  }

  vec3 color = vec3(BASE_COLOR + (occlusion * EXPOSURE * LIGHT_COLOR));

  gl_FragColor = vec4(color, 1);
}