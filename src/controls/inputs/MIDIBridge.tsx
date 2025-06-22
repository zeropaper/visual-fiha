import { useCallback, useEffect, useRef, useState } from "react";

import * as akaiLPD8 from "./MIDIBridge.akai-lpd8";

declare global {
  interface Window {
    _midiAccess: MIDIAccess | null;
  }
}

export function MIDIBridge({
  writeInputValues,
}: {
  writeInputValues: (path: string, value: any) => void;
}) {
  const [midiState, setMidiState] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [midiInputs, setMidiInputs] = useState<Record<string, boolean>>({});

  // Use a ref to keep a stable handler reference
  const midiMessageHandlerRef = useRef<(event: MIDIMessageEvent) => void>();

  // Handler for MIDI messages (stable reference)
  if (!midiMessageHandlerRef.current) {
    midiMessageHandlerRef.current = (event: MIDIMessageEvent) => {
      const data = event.data;
      if (!data || data.length < 3) {
        console.warn("MIDI message too short:", data);
        return;
      }
      akaiLPD8.adapter(
        (path, value) => writeInputValues(`midi.${path}`, value),
        data,
      );
    };
  }

  // Add/remove listeners when inputs change
  useEffect(() => {
    if (!window._midiAccess) return;
    const handler = midiMessageHandlerRef.current!;
    const inputIds = Object.keys(midiInputs);
    const inputs = inputIds
      .map((id) => window._midiAccess!.inputs.get(id))
      .filter(Boolean) as MIDIInput[];
    // Add listeners
    inputs.forEach((input) => {
      input.addEventListener("midimessage", handler);
    });
    // Cleanup
    return () => {
      inputs.forEach((input) => {
        input.removeEventListener("midimessage", handler);
      });
    };
  }, [midiInputs]);

  // Handle MIDI input connection/disconnection
  const handleInputsChange = useCallback(() => {
    if (!window._midiAccess) return;
    setMidiInputs((prev) => {
      const updated = Object.fromEntries(
        Array.from(window._midiAccess?.inputs || []).map((entry) => [
          entry[0],
          typeof prev[entry[0]] === "undefined" ? true : !!prev[entry[0]],
        ]),
      );
      return updated;
    });
  }, []);

  // Request MIDI access and set up statechange listener
  useEffect(() => {
    let midiAccess: MIDIAccess | null = null;
    let cleanup = () => {};
    if (!window._midiAccess) {
      navigator.requestMIDIAccess().then(
        (ma) => {
          midiAccess = ma;
          window._midiAccess = ma;
          setMidiState("connected");
          ma.addEventListener("statechange", handleInputsChange);
          handleInputsChange();
          cleanup = () => {
            ma.removeEventListener("statechange", handleInputsChange);
            window._midiAccess = null;
          };
        },
        (error) => {
          console.error("Failed to get MIDI access:", error);
          setMidiState("disconnected");
        },
      );
    }
    return () => {
      cleanup();
    };
  }, [handleInputsChange]);

  return (
    <>
      MIDI <span>{midiState}</span>
      <ul>
        {Object.entries(midiInputs).map(([id, enabled]) => {
          const input = window._midiAccess?.inputs.get(id);
          if (!input) {
            return null;
          }
          return (
            <li key={id}>
              <span>{enabled ? "🟢" : "🔴"}</span> <span>{input.name}</span>{" "}
              <span>{input.manufacturer}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
