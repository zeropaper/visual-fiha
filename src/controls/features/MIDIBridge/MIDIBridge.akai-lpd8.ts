export const name = "LPD8 MIDI 1";
export const manufacturer = "AKAI professional LLC";
export const deviceName = "lpd8";

const knobs = {
  1: "knob1",
  2: "knob2",
  3: "knob3",
  4: "knob4",
  5: "knob5",
  6: "knob6",
  7: "knob7",
  8: "knob8",
} as const;

const forces = {
  60: "force1",
  62: "force2",
  64: "force3",
  65: "force4",
  67: "force5",
  69: "force6",
  71: "force7",
  72: "force8",
} as const;

const pads = {
  60: "pad1",
  62: "pad2",
  64: "pad3",
  65: "pad4",
  67: "pad5",
  69: "pad6",
  71: "pad7",
  72: "pad8",
} as const;

export const mappings = {
  183: knobs,
  151: forces,
  135: pads,
} as const;
