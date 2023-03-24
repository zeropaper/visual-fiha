import blobURI2DataURI from './blobURI2DataURI'

type ReadInterface = (name: string, defaultValue?: any) => any

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const noop = (...args: any[]): any => {}

export const rgba = (r = 0.5, g = 0.5, b = 0.5, a = 1) =>
  `rgba(${
    (r * 255).toFixed()
  }, ${
    (g * 255).toFixed()
  }, ${
    (b * 255).toFixed()
  }, ${
    a.toFixed(3)
  })`

export const hsla = (h = 0.5, s = 0.5, l = 0.5, a = 1) =>
  `hsla(${
    (h * 360).toFixed()
  }, ${
    (s * 100).toFixed()
  }%, ${
    (l * 100).toFixed()
  }%, ${
    a.toFixed(3)
  })`

export const repeat = (times = 1, func = noop) => {
  for (let t = 0; t < times; t += 1) {
    func(t, times)
  }
}

export const assetDataURI = async (asset: any) => {
  const uri = await blobURI2DataURI(asset.src)
  return uri
}

export const isFunction = (what: any) => typeof what === 'function'

export const toggled: Record<string, boolean> = {}
export const prevToggle: Record<string, any> = {}
export const toggle = (read: ReadInterface, name: string) => (on: any, off: any) => {
  const val = read(name)
  if (prevToggle[name] !== val && val) toggled[name] = !toggled[name]
  if (toggled[name] && isFunction(on)) on()
  if (!toggled[name] && isFunction(off)) off()
  prevToggle[name] = val
  return toggled[name]
}

export const inOut = (read: ReadInterface, name: string) => (on: any, off: any) => {
  const val = read(name)
  if (val && isFunction(on)) on()
  if (!val && isFunction(off)) off()
  return val
}

export const steps: Record<string, number> = {}
export const prevStepVals: Record<string, any> = {}
export const stepper = (read: ReadInterface, name: string, distance = 1) => {
  const val = read(name, 0)
  steps[name] = steps[name] || 0
  if (!prevStepVals[name] && val) steps[name] += distance
  prevStepVals[name] = val
  return steps[name]
}

export const merge = (...objs: Array<Record<string, any>>) => {
  const result: Record<string, any> = {}
  objs.forEach((obj) => {
    Object.keys(obj).forEach((key) => {
      result[key] = obj[key]
    })
  })
  return result
}

const tools = {
  rgba,
  hsla,
  repeat,
  noop,
  assetDataURI,
  isFunction,
  toggle,
  inOut,
  stepper,
  merge
}

// export const apiReference = reference;

export default tools
