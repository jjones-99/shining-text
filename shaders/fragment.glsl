/**

Most of the neat code is here.

This shader performs calculations with a light source at the mouse,
occlusion by u_textureMask, and a background of u_textureBase to create the effect.

Credit goes to Liam Egan @ https://codepen.io/shubniggurath/pen/GGXKJe for the original idea.
I had never used Three.js nor shaders before seeing that, and recreating it from scratch taught me
how shaders work.

*/

// From main.ts
uniform vec2 u_resolution; // The resolution of the canvas DOM element.
uniform vec2 u_mouse; // The position of the mouse.
uniform sampler2D u_textureMask; // This texture controls occlusion and light beams.
uniform sampler2D u_textureBase; // This texture controls the background.

// From vertex.glsl
varying vec2 vertexUV; // We normally calculate uv with resolution/SCALE, but this is the plain one passed to vertex.glsl.

const bool INVERT_MASK = false; // Invert the meaning of the mask in terms of occlusion. true = black represents "holes".
const float DECAY = .7; // Multiplicative decay of illumination each iteration. Higher = further brighter light.
const float EXPOSURE = .35; // Overall exposure for the light. 
const float LIGHT_STRENGTH = 1.5; // The further the light travels from the source (not iterations, just the base aura.)
const vec3 LIGHT_COLOR = vec3(1.5, 1.6, .6); // When the pixel is closer to the light source, more of this color.
const vec3 FALLOFF_COLOR = vec3(2.0, 1.0, 0.); // As the pixel is further from the light source, more of this color.
const vec3 BACKGROUND_COLOR = vec3(.25, 0.25, .25); // The base color of the background (unused with u_textureBase).
const vec3 BASE_MASK_COLOR = vec3(-0.4251, -0.4416, -0.4276); // The base color to use where the mask is 'active'.
const float FALLOFF = .9; // Strength of the falloff color.
const int SAMPLES = 25; // Number of iterations of light movement. Higher = smoother light.
const float DENSITY = .8; // Amount that the light is 'caught in the air'. Higher numbers mean beams travel further.
const float WEIGHT = .25; // Strength of each iteration. Higher = stronger beams.
const float SCALE = 2.; // Inverse scale of the texture on the screen. Higher = smaller

// Gets a random float based on input vec2.
float randomFrom2D(vec2 uv) {
  // from https://thebookofshaders.com/10/
  return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Gets the strength of the mask at the given position. Averages the RGB values.
//  Using this alone (vec3(mask, mask, mask, 1.0)) would greyscale the mask.
float getMask(vec2 uv) {
  vec4 mask = texture2D(u_textureMask, (uv) + .5, -1.);
  float average = (mask.x + mask.y + mask.z) / 3.;
  if (INVERT_MASK) return 1. - average;
  return average;
}

// Gets the base illumination value if we're at a given distance from the light, given being masked by some amount.
//  Using this alone would give you no light beams shining out from the mask.
float getOcclusion(float distanceFromLight, float mask) {
  return (1. - smoothstep(0.0, LIGHT_STRENGTH, distanceFromLight)) * (1. - mask);
}

// Gets the pixel at the given position in the base texture.
vec4 getBase(vec2 uv) {
  return texture2D(u_textureBase, uv);
}

// Wraps up all computation.
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

  // Bring together our main light and falloff light colors.
  vec3 lightColor = mix(LIGHT_COLOR, FALLOFF_COLOR, distanceFromLight * FALLOFF);

  // Base colors based on the different textures.
  vec3 baseMaskColor = (1. - mask) * BASE_MASK_COLOR;
  vec4 baseColor = getBase(vertexUV);

  // Bring together all information to calculate the final color.
  vec3 color = vec3(baseColor.xyz + baseMaskColor.xyz + occlusion * EXPOSURE * lightColor);
  
  // Give that color to three.js.
  gl_FragColor = vec4(color, 1.0);
}