import { workspace } from 'vscode';

export default function configuration(
  key?: string,
  value?: string | boolean | number | null) {
  const conf = workspace.getConfiguration('visualFiha.settings');
  if (!key) {
    return conf;
  }

  if (typeof value === 'undefined') {
    return conf.get(key);
  }

  return conf.update(key, value);
}