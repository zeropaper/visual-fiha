import { useWriteInputValues } from "@contexts/ControlsContext";
import { useCopyToClipboard } from "@controls/hooks/useCopyToClipboard";
import { Button, buttonStyles } from "@ui/Button";
import { CopyIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as akaiLPD8 from "./MIDIBridge.akai-lpd8";
import styles from "./MIDIBridge.module.css";

declare global {
  interface Window {
    _midiAccess: MIDIAccess | null;
  }
}

function MIDIDevice({ id, input }: { id: string; input: MIDIInput }) {
  const [copied, copy] = useCopyToClipboard();
  return (
    <li key={id} className={styles.device}>
      <Button
        variant="icon"
        title="Copy the read function usage."
        onClick={() => copy(`read('midi.${id}')`)}
        className={[
          buttonStyles.button,
          buttonStyles.icon,
          copied ? buttonStyles.success : "",
        ].join(" ")}
      >
        <CopyIcon />
      </Button>
      <span className={styles.name}>{input.name}</span>{" "}
      <span className={styles.manufacturer}>{input.manufacturer}</span>
    </li>
  );
}

export function MIDIBridge() {
  const writeInputValues = useWriteInputValues();
  const [midiInputs, setMidiInputs] = useState<Record<string, boolean>>({});
  const listenersRef =
    useRef<Record<string, (event: MIDIMessageEvent) => void>>();

  // Add/remove listeners when inputs change
  useEffect(() => {
    if (!window._midiAccess) return;
    const inputIds = Object.keys(midiInputs);
    const inputs = inputIds
      .map((id) => window._midiAccess!.inputs.get(id))
      .filter(Boolean) as MIDIInput[];

    inputs.forEach((input) => {
      const listener =
        listenersRef.current?.[input.id] ||
        ((event: MIDIMessageEvent) => {
          let deviceName: string | undefined;
          let mappings: Record<number, Record<number, string>> | undefined;
          if (
            input.manufacturer === akaiLPD8.manufacturer &&
            input.name === akaiLPD8.name
          ) {
            deviceName = akaiLPD8.deviceName;
            mappings = akaiLPD8.mappings;
          }
          if (!deviceName || !mappings) {
            return;
          }
          const [type, index, value] =
            (event.data as unknown as [number, number, number]) || [];
          const button = mappings?.[type]?.[index];
          if (!button) {
            console.warn("Unknown MIDI message:", deviceName, type, index);
            return;
          }
          writeInputValues(`midi.${deviceName}.${button}`, value);
        });
      input.addEventListener("midimessage", listener);
    });
    // Cleanup
    return () => {
      inputs.forEach((input) => {
        const listener = listenersRef.current?.[input.id];
        if (listener) {
          input.removeEventListener("midimessage", listener);
        }
      });
    };
  }, [midiInputs, writeInputValues]);

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
    let cleanup = () => {};
    if (!window._midiAccess) {
      navigator.requestMIDIAccess().then(
        (ma) => {
          window._midiAccess = ma;
          ma.addEventListener("statechange", handleInputsChange);
          handleInputsChange();
          cleanup = () => {
            ma.removeEventListener("statechange", handleInputsChange);
            window._midiAccess = null;
          };
        },
        (error) => {
          console.error("Failed to get MIDI access:", error);
        },
      );
    }
    return () => {
      cleanup();
    };
  }, [handleInputsChange]);

  return (
    <ul className={styles.devices}>
      {Object.entries(midiInputs).map(([id]) => {
        const input = window._midiAccess?.inputs.get(id);
        if (!input?.manufacturer) {
          return null;
        }
        return <MIDIDevice key={id} id={id} input={input} />;
      })}
    </ul>
  );
}
