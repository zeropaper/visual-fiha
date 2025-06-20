const degToRad = (deg: number) => (deg * Math.PI) / 180;
let fraction = 1;

type MeshMaterial =
  | THREE.MeshStandardMaterial
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
    const material = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.75,
      metalness: 0.25,
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

    group.translateY(1 - fraction);

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

  unfold = (f = 1) => {
    const { group } = this;
    const distance = degToRad(180);
    const leftStart = degToRad(-90);
    const rightStart = degToRad(-90);
    const frontStart = degToRad(-180);
    const backGroupStart = degToRad(-90);
    const topStart = degToRad(-90);

    const {
      left,
      right,
      top,
      // bottom,
      front,
      // back,
      backGroup,
    } = this.faces;

    left.rotation.set(leftStart + distance * f, 0, 0);
    right.rotation.set(rightStart - distance * f, 0, 0);
    front.rotation.set(degToRad(90), frontStart - distance * f, degToRad(90));
    backGroup.rotation.set(0, 0, backGroupStart + distance * f);
    top.rotation.set(0, 0, topStart + distance * f);

    group.position.set(0, 0, 0);
    group.translateY(1 - f - 0.5);
  };

  setColor = (color: number | string) => {
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
  };
}