import { AppState } from '../types';

export default function renderStateDump({
  displays,
  server,
  ...state
}: AppState) {
  const root = document.getElementById('state-dump');
  if (!root) return;
  try {
    root.innerHTML = JSON.stringify(state, null, 2);
  } catch (err) {
    root.innerHTML = err.message;
  }
}
