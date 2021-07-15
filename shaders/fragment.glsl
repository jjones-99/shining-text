uniform vec2 u_resolution;
uniform float u_pxaspect;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_noise;
uniform sampler2D u_textureMask;
uniform bool u_mousemoved;

const float DECAY = .75; // the amount to decay each sample by
const float EXPOSURE = .35; // the screen exposure
const float LIGHT_STRENGTH = 3.5;
const vec3 LIGHT_COLOR = vec3(1.5, 1.6, .6); // the colour of the light
const vec3 FALLOFF_COLOR = vec3(2.0, 1.0, 0.); // the colour of the falloff
const vec3 BASE_COLOR = vec3(.25, 0.25, .25); // the base colour of the render
const float FALLOFF = .5;
const int SAMPLES = 15; // The number of samples to take
const float DENSITY = .3; // The density of the "smoke"
const float WEIGHT = .25; // how heavily to apply each step of the supersample
const float SCALE = 2.;

float randomFrom2D(vec2 uv) {
  // from https://thebookofshaders.com/10/
  return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453123);
}

float getMask(vec2 uv) {
  return texture2D(u_textureMask, (uv) + .5, -1.).x;
}

float getOcclusion(float distanceFromLight, float mask) {
  return (1. - smoothstep(0.0, LIGHT_STRENGTH, distanceFromLight)) * (1. - mask);
}

void main() {
  // Where is this pixel in our coordinate system?
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x) * SCALE;
  
  // Where's the light source?
  vec2 lightPosition = u_mouse * SCALE;
  vec2 displacementFromLight = uv - lightPosition;
  float distanceFromLight = length(displacementFromLight);
  
  // Check how the pixel is masked in our main texture.
  float mask = getMask(uv);

  // Check what light is visible given that mask.
  float occlusion = getOcclusion(distanceFromLight, mask);

  // When we check locations towards the light source for "holes", go this far each item.
  vec2 displacementPerIter = DENSITY * displacementFromLight / float(SAMPLES);

  // This falls over time, making each sample weaker.
  float illuminationStrength = 1.;

  // Check for "holes in the wall"
  //   at "SAMPLES" places along a line towards the light source, 
  //   DENSITY amount of the distance towards the light source.
  for(int i=0; i < SAMPLES; i++) {
    // Go towards the light source.
    vec2 newPoint = (uv - displacementPerIter * (float(i + 2)));

    // Introduce some scattering along that line to smooth the steps.
    float dither = randomFrom2D(uv) * 2.;
    vec2 scatteredPoint = newPoint + (displacementPerIter * dither);

    // Check the new, scattered position.
    occlusion += getOcclusion(distanceFromLight, getMask(scatteredPoint)) * illuminationStrength * WEIGHT;
    
    // Weaken further iterations.
    illuminationStrength *= DECAY;
  }

  vec3 lightColor = mix(LIGHT_COLOR, FALLOFF_COLOR, distanceFromLight * FALLOFF);

  vec3 colour = vec3(BASE_COLOR + occlusion * EXPOSURE * lightColor);
  
  gl_FragColor = vec4(colour,1.0);
}