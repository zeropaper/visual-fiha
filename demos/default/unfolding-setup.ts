console.info("start unfolding setup");

scene.clear();

camera.position.set(15, 30, 30);
camera.lookAt(0, 0, 0);

const grid = new THREE.GridHelper(20, 20);
const axes = new THREE.AxesHelper(3);

/*
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
ambientLight.name = "ambientLight";
scene.add(ambientLight);

/*
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
directionalLight.name = "directionalLight";
scene.add(directionalLight);
cache.directionalLight = directionalLight;

directionalLight.position.set(5, 12, 7);
directionalLight.target.position.set(0, 0, 0);
/* 
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
cache.directionalLightHelper = directionalLightHelper;
scene.add(directionalLightHelper);
 */

/*
 */
const spotLight = new THREE.SpotLight(0xff0000, 10, 30, deg2rad(20), 0.3, 0.2);
spotLight.name = "spotLight";
spotLight.castShadow = true;
spotLight.position.set(5, 12, 7);
spotLight.target.position.set(0, 0, 0);
scene.add(spotLight);
cache.spotLight = spotLight;
/* 
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
cache.spotLightHelper = spotLightHelper;

scene.add(spotLightHelper); */

/* 
scene.add(grid);
scene.add(axes);
 */

function follow() {
  const [x, y, z] = camera.position.toArray();
  /* 
    directionalLight.position.set(x,y,z);
    directionalLight.lookAt(0, 0, 0);
    directionalLight.target.position.set(0, 0, 0);
    directionalLightHelper.position.set(x,y,z);
    directionalLightHelper.lookAt(0, 0, 0);
  
    spotLight.position.set(x,y,z);
    spotLight.lookAt(0, 0, 0);
    spotLight.target.position.set(0, 0, 0);
    spotLightHelper.position.set(x,y,z);
    spotLightHelper.lookAt(0, 0, 0);
   */
}

type MeshMaterial =
  | THREE.MeshLambertMaterial
  | THREE.MeshBasicMaterial
  | THREE.MeshLambertMaterial;

class UnfoldingCube extends THREE.Group {
  constructor() {
    super();
    this.group = new THREE.Group();
    this.add(this.group);
    this.faces = this.init();
    this.unfold(0);
  }

  private group: THREE.Group;

  private faces: {
    left: THREE.Mesh;
    right: THREE.Mesh;
    top: THREE.Mesh;
    bottom: THREE.Mesh;
    front: THREE.Mesh;
    backGroup: THREE.Group;
    back: THREE.Mesh;
  };

  private init() {
    const { group } = this;

    const geometry = new THREE.BoxGeometry(1, 0.01, 1);
    const material = new THREE.MeshLambertMaterial({
      color: 0x222222,
    });

    const bottom = new THREE.Mesh(geometry, material);

    const left = new THREE.Mesh(geometry.clone(), material);
    left.geometry.translate(0, 0, -0.5);
    left.position.z = -0.5;

    const right = new THREE.Mesh(geometry.clone(), material);
    right.geometry.translate(0, 0, -0.5);
    right.position.z = 0.5;

    const front = new THREE.Mesh(geometry.clone(), material);
    front.geometry.translate(0, 0, -0.5);
    front.position.x = -0.5;

    const backGroup = new THREE.Group();
    backGroup.position.x = 0.5;

    const back = new THREE.Mesh(geometry.clone(), material);
    back.position.x = 0.5;

    const top = new THREE.Mesh(geometry.clone(), material);
    top.position.x = 1;
    top.geometry.translate(0.5, 0, 0);

    backGroup.add(back);
    backGroup.add(top);

    group.add(bottom);
    group.add(left);
    group.add(right);
    group.add(front);
    group.add(backGroup);

    top.castShadow = true;
    bottom.castShadow = true;
    left.castShadow = true;
    right.castShadow = true;
    front.castShadow = true;
    back.castShadow = true;

    top.receiveShadow = true;
    bottom.receiveShadow = true;
    left.receiveShadow = true;
    right.receiveShadow = true;
    front.receiveShadow = true;
    back.receiveShadow = true;

    // group.translateY(1 - fraction);

    return {
      front,
      backGroup,
      back,
      left,
      right,
      top,
      bottom,
    };
  }

  private prevAf = 0;

  unfold = (f = 1) => {
    const af = f % 1;
    const { group } = this;
    const distance = deg2rad(180);
    const leftStart = deg2rad(-90);
    const rightStart = deg2rad(-90);
    const frontStart = deg2rad(-180);
    const backGroupStart = deg2rad(-90);
    const topStart = deg2rad(-90);

    const {
      left,
      right,
      top,
      // bottom,
      front,
      // back,
      backGroup,
    } = this.faces;

    left.rotation.set(leftStart + distance * af, 0, 0);
    right.rotation.set(rightStart - distance * af, 0, 0);
    front.rotation.set(deg2rad(90), frontStart - distance * af, deg2rad(90));
    backGroup.rotation.set(0, 0, backGroupStart + distance * af);
    top.rotation.set(0, 0, topStart + distance * af);

    group.position.set(0, 0, 0);
    group.translateY(1 - af - 0.5);

    if (this.prevAf > af) {
      group.rotateY(deg2rad(random() < 0.5 ? -90 : 90));
    }
    this.prevAf = af;
  };

  set color(color: string | number) {
    const { left, right, top, bottom, front, back } = this.faces;

    const set = (m: THREE.Mesh["material"]) => {
      if (Array.isArray(m)) {
        m.forEach(set);
      } else {
        (m as MeshMaterial).color.set(color);
      }
    };

    set(left.material);
    set(right.material);
    set(top.material);
    set(bottom.material);
    set(front.material);
    set(back.material);
  }

  set wireframe(wireframe: boolean) {
    const { left, right, top, bottom, front, back } = this.faces;

    const set = (m: THREE.Mesh["material"]) => {
      if (Array.isArray(m)) {
        m.forEach(set);
      } else {
        (m as MeshMaterial).wireframe = wireframe;
      }
    };

    set(left.material);
    set(right.material);
    set(top.material);
    set(bottom.material);
    set(front.material);
    set(back.material);
  }
}

const unfoldingCubes = [];
const gridSize = 16;
const spacing = 5;
const centeringShift = (gridSize - 1) * spacing * 0.5;
for (let i = 0; i < gridSize; i++) {
  for (let j = 0; j < gridSize; j++) {
    const cube = new UnfoldingCube();
    cube.position.set(
      i * spacing - centeringShift,
      0,
      j * spacing - centeringShift,
    );
    cube.color = 0xf5d8ff;
    scene.add(cube);
    unfoldingCubes.push(cube);
  }
}
cache.unfoldingCubes = unfoldingCubes;

cache.render = () => {
  follow();
  renderer.render(scene, camera);
};
/* 
const geometry = new THREE.PlaneGeometry( 40, 40, 10, 10 );
const material = new THREE.MeshLambertMaterial( { color: 0x666666, side: THREE.DoubleSide,  } );
const plane = new THREE.Mesh( geometry, material );
plane.receiveShadow = true;
plane.rotateX(deg2rad(90));
plane.position.set(0, -6, 0)
scene.add( plane );
 */
console.info("done unfolding setup");
