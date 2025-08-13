console.info("start threejs setup");

cache.animationNow = 0;
scene.clear();

const onLoad = (gltf: any) => {
  gltf.scene.name = "fiha-explosion-1";
  scene.add(gltf.scene);
  // console.info('gltf', gltf);
  // gltf.animations; // Array<THREE.AnimationClip>
  // gltf.scene; // THREE.Group
  // gltf.scenes; // Array<THREE.Group>
  // gltf.cameras; // Array<THREE.Camera>
  // gltf.asset; // Object
  cache.gltf = gltf;
  // play the gltf animations if any
  if (gltf.animations && gltf.animations.length > 0) {
    const mixer = new THREE.AnimationMixer(gltf.scene);
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });
    cache.mixer = mixer;
  }
};

if (!cache.gltf) {
  const loader = new GLTFLoader();
  loader.load("/gltf/fiha-explosion-1.gltf", onLoad);
} else if (!scene.getObjectByName(cache.gltf.scene.name)) {
  scene.add(cache.gltf.scene);
}

camera.position.set(10, 0.4, 10);
camera.setFocalLength(47);

camera.lookAt(0, 0.4, 0);

const ambientLight = new THREE.AmbientLight(0x666666);
ambientLight.name = "ambientLight";
scene.add(ambientLight);

const directionalLight = new THREE.SpotLight(0xffffff, 1);
directionalLight.name = "directionalLight";
scene.add(directionalLight);

directionalLight.angle = 40;
cache.directionalLight = directionalLight;
directionalLight.position.set(5, 12, 7);

directionalLight.target.position.set(0, 0, 0);
directionalLight.lookAt(0, 0, 0);

const grid = new THREE.GridHelper(20, 20);
const axes = new THREE.AxesHelper(3);
const directionalLightHelper = new THREE.SpotLightHelper(directionalLight);
cache.directionalLightHelper = directionalLightHelper;

/*
scene.add(directionalLightHelper);
scene.add(grid);
scene.add(axes);
*/

const params = {
  threshold: 0,
  strength: 0.5,
  radius: 0,
  exposure: 1,
};
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(read("stage.width", 800), read("stage.height", 600)),
  1.5,
  0.4,
  0.85,
);
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

const outputPass = new OutputPass();

const renderScene = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(outputPass);
cache.composer = composer;

console.info("done threejs setup", {
  scene,
  composer,
  renderer,
  camera,
});
