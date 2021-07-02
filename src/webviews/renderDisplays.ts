import { AppState, DisplayBase } from '../types';

export default function renderDisplays(displays: DisplayBase[], state: AppState) {
  const root = document.getElementById('displays');
  if (!root) return;
  const url = `http://${state.displayServer.host}:${state.displayServer.port}`;
  console.info('[main] render displays', displays);
  const newDisplayLink = `<a href="${url}">${url}</a>`;

  if (!displays.length) {
    root.innerHTML = newDisplayLink;
    return;
  }

  root.innerHTML = [
    '<div class="displays-wrapper">',
    ...displays.map(({ width, height }) => `<div
      class="display"
      style="width: ${Math.round((width || 1280) * 0.1)}px; height: ${Math.round((height || 980) * 0.1)}px;"
    >
      ${width}x${height}
    </div>`),
    '</div>',
    `<div>${newDisplayLink}</div>`,
  ].join('');
}
