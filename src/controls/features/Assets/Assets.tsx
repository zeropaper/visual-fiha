import { useAppFastContextFields } from "@contexts/ControlsContext";
import { useFileSystem } from "@controls/contexts/FileSystemContext";
import { Button } from "@ui/Button";
import { LinkIcon } from "lucide-react";
import type { AssetConfig } from "src/types";
import sectionStyles from "../../ControlsApp.module.css";
import styles from "./Assets.module.css";

function LocalAsset({ id, state }: AssetConfig) {
  const { selectedDirectory, selectDirectory } = useFileSystem();
  return (
    <li>
      {state}{" "}
      {selectedDirectory?.name ? (
        selectedDirectory?.name
      ) : (
        <Button variant="icon" title="Link" onClick={selectDirectory}>
          <LinkIcon />
        </Button>
      )}{" "}
      {id}
    </li>
  );
}

export function Assets() {
  const {
    assets: { get: assets },
  } = useAppFastContextFields(["assets"]);

  return (
    <details open className={[sectionStyles.details, "assets"].join(" ")}>
      <summary>Assets</summary>

      <ul id="assets" className={styles.assets}>
        {assets.map((asset, l) => {
          switch (asset.source) {
            case "local":
              return <LocalAsset key={asset.id} {...asset} />;
            default:
              return (
                <li key={asset.id}>
                  {asset.source}
                  {asset.id}
                </li>
              );
          }
        })}
      </ul>
    </details>
  );
}
