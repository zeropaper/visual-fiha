import type { Socket } from "socket.io-client";
import type { DefaultEventsMap } from "socket.io/dist/typed-events";
import type { ChannelPost } from "../utils/com";

let midi: MIDIAccess;

const dataKeys = ["unknown", "id", "value"];
type DataObject = Record<(typeof dataKeys)[number], number>;

function dataToObject(data: Uint8Array): DataObject {
  return data.reduce((acc, val, i) => {
    acc[dataKeys[i]] = val;
    return acc;
  }, {} as any) as DataObject;
}

function midiMessageListener(evt: any) {
  if (!(evt instanceof MIDIMessageEvent)) return;
  console.info("MIDI Message", dataToObject(evt.data));
}

function processState() {
  console.info("MIDI State", midi);
  if (!midi?.inputs) return;

  midi.inputs.forEach((input) => {
    console.info("MIDI Input", input);
    input.removeEventListener("midimessage", midiMessageListener, false);
    input.addEventListener("midimessage", midiMessageListener, false);
  });
}

export default async function midiCapture(
  post: ChannelPost,
  socket: Socket<DefaultEventsMap, DefaultEventsMap>,
) {
  midi = await navigator.requestMIDIAccess();
  console.info("MIDI Access", midi);
  midi.onstatechange = processState;
  processState();
}
