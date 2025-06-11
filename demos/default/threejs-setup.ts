cache.animationNow = 0;
scene.clear();

if (!cache.gltf) {
  const loader = new GLTFLoader();
  // Load a glTF resource
  loader.load(
    // resource URL
    '/gltf/fiha-explosion-1.gltf',
    // called when the resource is loaded
    function (gltf) {
      console.info('load GLTF')
      gltf.scene.name = 'fiha-explosion-1';
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
      } else {
        // console.info('no animations found in gltf');
      }
      // console.info('gltf loaded', gltf.scene.name);
    },
    // called while loading is progressing
    function (xhr) {
      // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // called when loading has errors
    function (error) {
      console.log('An error happened');
    }
  );
} else if (!scene.getObjectByName(cache.gltf.scene.name)) {
  scene.add(cache.gltf.scene);
}

camera.position.x = 10;
camera.position.y = 10;
camera.position.z = 10;
camera.setFocalLength(47);

camera.lookAt(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0x666666);
ambientLight.name = 'ambientLight';
scene.add(ambientLight);


const directionalLight = new THREE.SpotLight(0xffffff, 1);
directionalLight.name = 'directionalLight';
scene.add(directionalLight);

directionalLight.angle = 40;
cache.directionalLight = directionalLight;

directionalLight.position.x = 5;
directionalLight.position.y = 7;
directionalLight.position.z = 7;

directionalLight.target.position.x = 0;
directionalLight.target.position.y = 0;
directionalLight.target.position.z = 0;
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