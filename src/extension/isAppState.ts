import { type AppState } from '../types'

export function isAppState (value: any): value is AppState {
  return value != null && typeof value === 'object' && typeof value.id === 'string'
}
