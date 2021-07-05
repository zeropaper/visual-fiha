import Display from './Display';

const display = new Display();

window.addEventListener('resize', () => {
  display.resize();
});

window.addEventListener('beforeunload', () => {
  display.post('unregister');
});
