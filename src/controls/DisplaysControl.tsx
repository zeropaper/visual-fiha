import { useAppFastContextFields } from "@contexts/ControlsContext";
import { Button } from "@ui/Button";

export function DisplaysControl() {
  const {
    displays: { get: displays },
  } = useAppFastContextFields(["displays"]);

  return (
    <>
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
    </>
  );
}
