import {
  Layer,
  TypeDirectory,
} from '../types';
import readScripts from './readScripts';

export default function readLayerScripts(type: keyof typeof TypeDirectory) {
  return async (info: Layer): Promise<Layer> => ({
    ...info,
    ...(await readScripts(type, info.type, info.id)),
  });
}
