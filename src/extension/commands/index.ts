import type { VFCommand } from '../../types'
import openControls from './openControls'
import openEditor from './openEditor'
import setBPM from './setBPM'
import createLayer from './createLayer'
import removeLayer from './removeLayer'
import toggleLayer from './toggleLayer'
import setStageSize from './setStageSize'
import resetData from './resetData'
import scaffoldProject from './scaffoldProject'

export type Commands = Record<string, VFCommand>

const commands: Commands = {
  openControls,
  openEditor,
  setBPM,
  createLayer,
  removeLayer,
  toggleLayer,
  setStageSize,
  resetData,
  scaffoldProject
}

export default commands
