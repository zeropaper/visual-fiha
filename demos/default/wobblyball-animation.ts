const now = read("time.elapsed", 0);

camera.position.set(0, 0, 8);
camera.lookAt(0, 0, 0);

const amp =
  read("audio.0.0.timeDomain.max", 0) - read("audio.0.0.timeDomain.min", 0);
const freqMax = read("audio.0.0.frequency.max", 0);

const { material } = cache as unknown as { material: THREE.ShaderMaterial };
material.uniforms.uAmp.value = amp * 0.01;
material.uniforms.uTime.value = now * 0.001;
cache.mesh.rotation.y = (freqMax - 60) * 0.1;
cache.mesh.rotation.x = (freqMax - 90) * 0.1;
camera.setFocalLength(35 + amp * 0.5);

// material.wireframe = read("audio.0.0.frequency.max", 127) > 120;

renderer.render(scene, camera);
