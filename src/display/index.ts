import Display from './Display';

const display = new Display({
  id: window.location.hash.slice(1),
});

window.addEventListener('resize', () => {
  display.resize();
});

window.addEventListener('beforeunload', () => {
  display.post('unregister');
});

// when double clicking on the window its body goes fullscreen
window.addEventListener('dblclick', () => {
  if (document.body.requestFullscreen) {
    document.body.requestFullscreen();
  }
});
