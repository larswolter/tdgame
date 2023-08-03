import { Effect, Scene, ShaderMaterial, Texture } from "@babylonjs/core";

export const createTerrainMaterial = ({
  t1,
  t2,
  scene,
}: {
  t1: string;
  t2: string;
  scene: Scene;
}) => {
  Effect.ShadersStore["customVertexShader"] = `
    precision highp float;
    attribute vec3 position;
    attribute vec2 uv;
    attribute vec2 uv2;
    uniform mat4 worldViewProjection;
    varying vec2 vUv;
    varying float mixVar;
    varying vec3 pos;
    
    void main() {
        vec4 p = vec4(position, 1.);
        gl_Position = worldViewProjection * p;
        vUv = uv;
        pos = position;
        mixVar = uv2.x;
    }
`;

  Effect.ShadersStore["customFragmentShader"] = `
  varying vec2 vUv;
  varying vec3 pos;
  varying float mixVar;
  uniform sampler2D textureSampler;
  uniform sampler2D baseSampler;
  // 2D Random
  float random (in vec2 st) {
      return fract(sin(dot(st.xy,
                          vec2(12.9898,78.233)))
                  * 43758.5453123);
  }

  // 2D Noise based on Morgan McGuire @morgan3d
  // https://www.shadertoy.com/view/4dS3Wd
  float noise (in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);

      // Four corners in 2D of a tile
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));

      // Smooth Interpolation

      // Cubic Hermine Curve.  Same as SmoothStep()
      vec2 u = f*f*(3.0-2.0*f);
      // u = smoothstep(0.,1.,f);

      // Mix 4 coorners percentages
      return mix(a, b, u.x) +
              (c - a)* u.y * (1.0 - u.x) +
              (d - b) * u.x * u.y;
  }
  void main() {
      vec2 st = gl_FragCoord.xy;

      // Scale the coordinate system to see
      // some noise in action
      // Use the noise function
      float n = noise(vUv*2.+vec2(pos.x,pos.z));

      vec4 color2 = texture2D(textureSampler, vUv);
      vec4 color = texture2D(baseSampler, vUv);
      float mixCol = (n+1.0)*mixVar;
      float invmix = 1.0 - mixCol;
      gl_FragColor = vec4(color.x*mixCol+color2.x*invmix, color.y*mixCol+color2.y*invmix, color.z*mixCol+color2.z*invmix, 1.);
  }
`;

  const shader = new ShaderMaterial(
    "shader",
    scene,
    { vertex: "custom", fragment: "custom" },
    {
      attributes: ["position", "uv", "uv2"],
      uniforms: ["worldViewProjection"],
      samplers: ["textureSampler", "baseSampler"],
    },
  );

  const texture1 = new Texture(t1, scene);
  const texture2 = new Texture(t2, scene);
  shader.setTexture("textureSampler", texture1);
  shader.setTexture("baseSampler", texture2);
  return shader;
};
