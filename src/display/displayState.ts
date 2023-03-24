import type { Layer } from '../types'

export interface DisplayState {
  meta: {
    displayId: string
    connected: boolean
    socketId?: string
  }
  data: object
  worker: {
    setup: string
    animate: string
  }
  layers: Layer[]
}

const defaultState: DisplayState = {
  meta: {
    displayId: `display${(Math.random() * 10000).toFixed()}`,
    connected: false
  },
  data: {},
  worker: {
    setup: '',
    animate: ''
  },
  layers: []
}

export default defaultState
