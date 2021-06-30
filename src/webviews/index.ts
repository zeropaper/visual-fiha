import type { AppState } from '../types';

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function main() {
  const defaultState: AppState = {
    data: {},
    displays: [],
    layers: [],
  };

  const vscode = acquireVsCodeApi<AppState>();

  const getState = (): AppState => vscode.getState() || defaultState;

  const oldState = getState();

  console.info('[main] oldState', oldState);

  const counter = document.getElementById('lines-of-code-counter');
  console.log('Initial state', oldState);

  let currentCount = (oldState && oldState.count) || 0;
  if (counter) counter.textContent = `${currentCount}`;

  setInterval(() => {
    if (counter) counter.textContent = `${currentCount += 1} `;

    // Update state
    vscode.setState({ ...getState(), count: currentCount });

    // Alert the extension when the cat introduces a bug
    if (Math.random() < Math.min(0.001 * currentCount, 0.05)) {
    // Send a message back to the extension
      vscode.postMessage({
        command: 'alert',
        text: `🐛  on line ${currentCount}`,
      });
    }
  }, 100);

  // Handle messages sent from the extension to the webview
  window.addEventListener('message', (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.command) {
      case 'refactor':
        currentCount = Math.ceil(currentCount * 0.5);
        if (counter) counter.textContent = `${currentCount}`;
        break;

      default:
        throw new Error(`Unknown command ${message.command}`);
    }
  });
}());
