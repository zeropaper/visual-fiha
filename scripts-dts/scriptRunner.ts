import type { ReadInterface, Cache } from '../src/utils/Scriptable';
import type { ScriptLog } from '../src/utils/ScriptRunner';

declare global {
  const read: ReadInterface;
  const cache: Cache;
  const scriptLog: ScriptLog;
}
