import { Button } from "@ui/Button";
import sectionStyles from "./ControlsApp.module.css";
import { useAppFastContextFields } from "./ControlsContext";

export function DisplaysControl() {
  const {
    displays: { get: displays, set: setDisplays },
  } = useAppFastContextFields(["displays"]);

  return (
    <details open className={[sectionStyles.details, "displays"].join(" ")}>
      <summary>Displays</summary>
      <Button
        onClick={() => {
          window.open(`/display#${displays.length}`, "_blank");
        }}
      >
        New Display
      </Button>
      <ul id="displays">
        {displays.map((display) => (
          <li key={display.id}>{display.id}</li>
        ))}
      </ul>
    </details>
  );
}
