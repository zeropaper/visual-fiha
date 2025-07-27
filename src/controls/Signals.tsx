import sectionStyles from "./ControlsApp.module.css";
import { useAppFastContextFields } from "./ControlsContext";

export function Signals() {
  const {
    signals: { get: signals, set: setSignals },
  } = useAppFastContextFields(["signals"]);

  return (
    <details open className={["signales", sectionStyles.details].join(" ")}>
      <summary>Signals</summary>
      <ul id="signals">
        {signals.map((signal) => (
          <li key={signal.name}>{signal.name}</li>
        ))}
      </ul>
    </details>
  );
}
