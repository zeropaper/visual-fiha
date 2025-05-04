import type * as mathTools from '../src/utils/mathTools'

declare global {
  const abs: typeof Math.abs
  const acos: typeof Math.acos
  const acosh: typeof Math.acosh
  const asin: typeof Math.asin
  const asinh: typeof Math.asinh
  const atan: typeof Math.atan
  const atanh: typeof Math.atanh
  const atan2: typeof Math.atan2
  const ceil: typeof Math.ceil
  const cbrt: typeof Math.cbrt
  const expm1: typeof Math.expm1
  const clz32: typeof Math.clz32
  const cos: typeof Math.cos
  const cosh: typeof Math.cosh
  const exp: typeof Math.exp
  const floor: typeof Math.floor
  const fround: typeof Math.fround
  const hypot: typeof Math.hypot
  const imul: typeof Math.imul
  const log: typeof Math.log
  const log1p: typeof Math.log1p
  const log2: typeof Math.log2
  const log10: typeof Math.log10
  const max: typeof Math.max
  const min: typeof Math.min
  const pow: typeof Math.pow
  const random: typeof Math.random
  const round: typeof Math.round
  const sign: typeof Math.sign
  const sin: typeof Math.sin
  const sinh: typeof Math.sinh
  const sqrt: typeof Math.sqrt
  const tan: typeof Math.tan
  const tanh: typeof Math.tanh
  const trunc: typeof Math.trunc
  const E: typeof Math.E
  const LN10: typeof Math.LN10
  const LN2: typeof Math.LN2
  const LOG10E: typeof Math.LOG10E
  const LOG2E: typeof Math.LOG2E
  const PI: typeof Math.PI
  const SQRT1_2: typeof Math.SQRT1_2
  const SQRT2: typeof Math.SQRT2

  const PI2: typeof mathTools.PI2
  const GR: typeof mathTools.GR
  const sDiv: typeof mathTools.sDiv
  const arrayMax: typeof mathTools.arrayMax
  const arrayMin: typeof mathTools.arrayMin
  const arraySum: typeof mathTools.arraySum
  const arrayDiff: typeof mathTools.arrayDiff
  const arrayAvg: typeof mathTools.arrayAvg
  const arrayMirror: typeof mathTools.arrayMirror
  const arrayDownsample: typeof mathTools.arrayDownsample
  const arraySmooth: typeof mathTools.arraySmooth
  const deg2rad: typeof mathTools.deg2rad
  const rad2deg: typeof mathTools.rad2deg
  const cap: typeof mathTools.cap
  const between: typeof mathTools.between
  const beatPrct: typeof mathTools.beatPrct
  const beat: typeof mathTools.beat

  // @ts-expect-error
  const orientation: typeof mathTools.orientation
  const objOrientation: typeof mathTools.objOrientation
  const containBox: typeof mathTools.containBox
  const coverBox: typeof mathTools.coverBox
}

export { }
