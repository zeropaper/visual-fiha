const now = read("time.elapsed", 0);
const fAvg = read("audio.0.0.frequency.average", 90) - 90;

cache.unfoldingCubes?.forEach((cube) => {
  cube.unfold(now * 0.001);
});

camera.position.y = 20;
camera.position.x = sin(now * 0.0001) * (300 * 0.1);
camera.position.z = cos(now * 0.0001) * (300 * 0.1);
camera.lookAt(0, 0, 0);

renderer.render(scene, camera);
