export const VERTEX = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

export const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D tMap;   // the layer, painted with Canvas 2D (premultiplied alpha)
  uniform sampler2D tFlow;  // cursor velocity trail from OGL's Flowmap
  uniform float uTime;
  uniform float uReveal;    // 0 -> 1 intro liquid reveal
  uniform float uGrow;      // 0 = no scaling, 0.5 = starts at 50% size and grows to 100%
  uniform vec2 uOrigin;     // point (in uv space) the layer grows from

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  // Chromatic aberration: sample R and B at opposite offsets
  vec4 sampleSplit(vec2 uv, vec2 off) {
    vec4 r = texture2D(tMap, uv + off);
    vec4 g = texture2D(tMap, uv);
    vec4 b = texture2D(tMap, uv - off);
    return vec4(r.r, g.g, b.b, max(r.a, max(g.a, b.a)));
  }

  void main() {
    vec3 flow = texture2D(tFlow, vUv).rgb;

    // Slow ambient liquid wobble
    vec2 wobble = vec2(
      fbm(vUv * 3.0 + uTime * 0.12),
      fbm(vUv * 3.0 + 7.3 - uTime * 0.12)
    ) - 0.5;

    // Liquid reveal mask: noise-edged wipe, bottom -> top
    float n = fbm(vUv * 3.5 + flow.xy * 1.5);
    float reveal = smoothstep(0.0, 0.18, uReveal * 1.7 - n * 0.9 - vUv.y * 0.5);

    // Grow-in: scale the layer around uOrigin while it reveals
    float scale = mix(1.0 - uGrow, 1.0, uReveal);
    vec2 uv = (vUv - uOrigin) / scale + uOrigin;

    // Distortion is stronger while the layer is still "liquid"
    float strength = 1.0 + (1.0 - uReveal) * 2.0;
    uv -= flow.xy * 0.08 * strength;
    uv += wobble * (0.004 + (1.0 - reveal) * 0.05);

    vec2 split = flow.xy * 0.03 + (1.0 - reveal) * vec2(0.0, 0.02);
    vec4 col = sampleSplit(uv, split);

    gl_FragColor = col * reveal; // premultiplied alpha output
  }
`
