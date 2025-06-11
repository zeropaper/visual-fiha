const now = read('time.elapsed', 0);
const fAvg = read('audio.0.0.frequency.average', 90) - 90;

camera.position.y = 3;
camera.position.x = 1 + 5 + Math.sin(now * 0.001) * (10 * 0.1);
camera.position.z = 1 + 20 + Math.cos(now * 0.001) * (10 * 0.1);
camera.lookAt(0, 0, 0);

const { gltf, mixer } = cache;
if (gltf && mixer) {
  mixer.setTime(max(0, min(10.4, abs(fAvg * 0.1))) + sin(now * 0.001));
}

renderer.render(scene, camera);