import { Button } from "@ui/Button";
import type { FC } from "react";
import styles from "./ControlsApp.module.css";
import { useFileSystem } from "./contexts/FileSystemContext";

const Menu: FC = () => {
  const { saveFiles, loadFiles, selectDirectory, selectedDirectory } =
    useFileSystem();

  return (
    <div className={styles.menu}>
      <Button type="button" onClick={selectDirectory}>
        Select Directory
      </Button>
      <Button type="button" onClick={saveFiles} disabled={!selectedDirectory}>
        Export
      </Button>
      <Button type="button" onClick={loadFiles} disabled={!selectedDirectory}>
        Load
      </Button>
    </div>
  );
};

export default Menu;
