import { useAppFastContextFields } from "@contexts/ControlsContext";
import { Button } from "@ui/Button";
import styles from "./Displays.module.css";

export function Displays() {
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

      <ul id="displays" className={styles.list}>
        {displays.map((display) => (
          <li key={display.id} className={styles.item}>
            <div className={styles.info}>
              <span className={styles.bold}>{`${display.id}`}</span>
              <span
                className={styles.dimmed}
              >{`${display.width}x${display.height}`}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
