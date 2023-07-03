import {
  type ScriptingData
  // DisplayBase,
  // Layer,
  // StageInfo,
} from '../types'

export function isScriptingData (value: any): value is ScriptingData {
  return value != null && typeof value === 'object' && typeof value.iterationCount === 'number'
}
