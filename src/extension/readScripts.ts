import { TypeDirectory } from '../types';
import scriptUri from './scriptUri';
import asyncReadFile from './asyncReadFile';

export default async function readScripts(type: keyof typeof TypeDirectory, id: string) {
  const setupFSPath = scriptUri(type, id, 'setup').path;
  const animationFSPath = scriptUri(type, id, 'animation').path;

  let setup = '';
  let animation = '';

  try {
    setup = await asyncReadFile(setupFSPath);
  } catch (e) { /* */ }
  try {
    animation = await asyncReadFile(animationFSPath);
  } catch (e) { /* */ }

  return {
    setup,
    animation,
  };
}
