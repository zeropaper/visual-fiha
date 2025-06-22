import type { MIDIBridgeAdapter } from "./MIDIBridge.types";

export const name = "LPD8 MIDI 1";
export const manufacturer = "AKAI professional LLC";
export const adapter: MIDIBridgeAdapter = (cb, data) => {
  let button: string;
  console.info("LPD8 MIDI message:", ...data);
  switch (data[0]) {
    case 183:
      button = `k${data[1]}`;
      break;
    case 151:
      switch (data[1]) {
        case 60:
          button = "f1";
          break;
        case 62:
          button = "f2";
          break;
        case 64:
          button = "f3";
          break;
        case 65:
          button = "f4";
          break;
        case 67:
          button = "f5";
          break;
        case 69:
          button = "f6";
          break;
        case 71:
          button = "f7";
          break;
        case 72:
          button = "f8";
          break;
        default:
          // console.warn('Unknown MIDI message:', data[1]);
          button = "";
          break;
      }
      break;
    case 135:
      switch (data[1]) {
        case 60:
          button = "p1";
          break;
        case 62:
          button = "p2";
          break;
        case 64:
          button = "p3";
          break;
        case 65:
          button = "p4";
          break;
        case 67:
          button = "p5";
          break;
        case 69:
          button = "p6";
          break;
        case 71:
          button = "p7";
          break;
        case 72:
          button = "p8";
          break;
        default:
          // console.warn('Unknown MIDI message:', data[1]);
          button = "";
          break;
      }
      break;
    default:
      console.warn("Unknown MIDI message:", data);
      button = "";
      break;
  }
  if (!button) {
    return;
  }
  cb(`lpd8.${button}`, data[2]);
};
