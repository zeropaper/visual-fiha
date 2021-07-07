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
