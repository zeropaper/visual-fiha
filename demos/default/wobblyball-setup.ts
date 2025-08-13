scene.clear();
console.info(
  "start wobbly ball setup",
  scene.children.map((child) => child.name || child.type),
);
const radius = 1;
const detail = 128;
const amp = 0.25;
const freq = 1.5;
const speed = 0.6;
const color = "#8bd3ff";
const edgeColor = "#4398cc";
const useIco = true;
const shadows = false;
const useWireframeGrid = false;
const edgeThreshold = 1;

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);
const dir = new THREE.DirectionalLight(0xffffff, 1);
dir.position.set(3, 4, 2);
if (shadows) dir.castShadow = true;
scene.add(dir);

// Geometry
const geometry = useIco
  ? new THREE.IcosahedronGeometry(
      radius,
      Math.max(0, Math.round(Math.log2(detail))),
    )
  : new THREE.SphereGeometry(radius, detail, detail);
geometry.computeVertexNormals();

// === GLSL noise (Ashima / Gustavson) ===
const snoise = /* glsl */ `
  vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod289(i);
    vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0; vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a1.xy, h.y);
    vec3 p2 = vec3(a0.zw, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }`;

// Shared uniforms so surface + lines animate identically
const uniforms = {
  uTime: { value: 0 },
  uAmp: { value: amp },
  uFreq: { value: freq },
  uSpeed: { value: speed },
  uColor: { value: new THREE.Color(color) },
  uEdgeColor: { value: new THREE.Color(edgeColor) },
} as const;

cache.uniforms = uniforms;

// --- SOLID (faceted) PASS ---
const baseMaterial = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: /* glsl */ `
      varying vec3 vWorldPos;
      uniform float uTime; uniform float uAmp; uniform float uFreq; uniform float uSpeed;
      ${snoise}
      void main(){
        vec3 pos = position;
        float n = snoise(normalize(pos) * uFreq + vec3(0.0, uTime * uSpeed, 0.0));
        // approximate normal using sphere direction for displacement
        vec3 nrm = normalize(pos);
        pos += nrm * (n * uAmp);
        vec4 world = modelMatrix * vec4(pos,1.0);
        vWorldPos = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
  fragmentShader: /* glsl */ `
      // Faceted/flat shading via geometric normal from derivatives
      #ifdef GL_OES_standard_derivatives
      #extension GL_OES_standard_derivatives : enable
      #endif
      varying vec3 vWorldPos;
      uniform vec3 uColor;
      void main(){
        vec3 fdx = dFdx(vWorldPos);
        vec3 fdy = dFdy(vWorldPos);
        vec3 N = normalize(cross(fdx, fdy));
        float light = dot(normalize(N), normalize(vec3(0.5, 0.8, 0.3))) * 0.5 + 0.5;
        gl_FragColor = vec4(uColor * light, 1.0);
      }
    `,
  dithering: true,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
});
baseMaterial.extensions = { derivatives: true } as any; // needed for WebGL1

const mesh = new THREE.Mesh(geometry, baseMaterial);
if (shadows) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}
scene.add(mesh);

// === Lines pass that deforms identically ===
const edgesGeo = useWireframeGrid
  ? new THREE.WireframeGeometry(geometry)
  : new THREE.EdgesGeometry(geometry, edgeThreshold);

const lineMaterial = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: /* glsl */ `
      uniform float uTime; uniform float uAmp; uniform float uFreq; uniform float uSpeed;
      ${snoise}
      void main(){
        vec3 pos = position;
        float n = snoise(normalize(pos) * uFreq + vec3(0.0, uTime * uSpeed, 0.0));
        vec3 nrm = normalize(pos);
        pos += nrm * (n * uAmp);
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
      }
    `,
  fragmentShader: /* glsl */ `
      uniform vec3 uEdgeColor;
      void main(){ gl_FragColor = vec4(uEdgeColor, 1.0); }
    `,
  transparent: true,
  blending: THREE.NormalBlending,
  depthTest: true,
  depthWrite: false,
});

const line = new THREE.LineSegments(edgesGeo, lineMaterial);
line.renderOrder = 1; // ensure drawn after the fill
mesh.add(line);
scene.add(mesh);

cache.material = baseMaterial;
cache.mesh = mesh;

console.info(
  "wobbly ball setup complete",
  scene.children.map((child) => child.name || child.type),
);
