uniform vec2 u_resolution;
  uniform float u_pxaspect;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform sampler2D u_noise;
  uniform sampler2D u_text500;
  uniform bool u_mousemoved;
  
  #define PI 3.141592653589793
  #define TAU 6.283185307179586

  const bool addNoise = true; // Whether to add noise to the rays
  const float decay = .96; // the amount to decay each sample by
  const float exposure = .35; // the screen exposure
  const float lightStrength = 3.5;
  const vec3 lightcolour = vec3(1.5, 1.6, .6); // the colour of the light
  const vec3 falloffcolour = vec3(.0, 1.0, 2.3); // the colour of the falloff
  const vec3 bgcolour = vec3(.0, 0.25, .25); // the base colour of the render
  const float falloff = .5;
  const int samples = 12; // The number of samples to take
  const float density = .98; // The density of the "smoke"
  const float weight = .25; // how heavily to apply each step of the supersample
  const int octaves = 1; // the number of octaves to generate in the FBM noise
  const float seed = 43758.5453123; // A random seed :)
  
  vec2 res = u_resolution / u_pxaspect;

  float shapes(vec2 uv) {
    uv += u_mouse * .1;
    float aspect = res.x / res.y;
    float scale = 1. / aspect * .3;
    return texture2D(u_text500, (uv) * scale + .5, -1.).x;
  }
  
  float occlusion(vec2 uv, vec2 lightpos, float objects) {
    return (1. - smoothstep(0.0, lightStrength, length(lightpos - uv))) * (1. - objects);
  }
  
  vec4 mainRender(vec2 uv, inout vec4 fragcolour) {
    vec2 _uv = uv;
    vec2 lightpos = (vec2(u_mouse.x, u_mouse.y * -1.)) / u_resolution.y;
    lightpos = u_mouse * scale;
    
    float obj = shapes(uv);
    float map = occlusion(uv, lightpos, obj);
    // dither = 0.;

    vec2 dtc = (_uv - lightpos) * (1. / float(samples) * density);
    float illumination_decay = 1.;
    vec3 basecolour = bgcolour;

    for(int i=0; i<samples; i++) {
      _uv -= dtc;
      
      float movement = u_time * 20. * float(i + 1);
      
      float dither = random2d(uv * 512. + mod(vec2(movement*sin(u_time * .5), -movement), 1000.)) * 2.;

      float stepped_map = occlusion(uv, lightpos, shapes(_uv+dtc*dither));
      stepped_map *= illumination_decay * weight;
      illumination_decay *= decay;

      map += stepped_map;
    }

    float l = length(lightpos - uv);

    vec3 lightcolour = mix(lightcolour, falloffcolour, l*falloff);

    vec3 colour = vec3(basecolour+map*exposure*lightcolour);
    
    fragcolour = vec4(colour,1.0);
    return fragcolour;
  }

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
  
  mainRender(uv, gl_FragColor);
}