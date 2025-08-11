import { useAppFastContextFields } from "@contexts/ControlsContext";
import { useFileSystem } from "@controls/contexts/FileSystemContext";
import { useCopyToClipboard } from "@controls/hooks/useCopyToClipboard";
import { Button, buttonStyles } from "@ui/Button";
import { CopyIcon, LinkIcon } from "lucide-react";
import type { AssetConfig } from "src/types";
import styles from "./Assets.module.css";

function LocalAsset({
  id,
  state,
  selectedDirectory,
}: AssetConfig & {
  selectedDirectory: FileSystemDirectoryHandle | null;
}) {
  const [copied, copy] = useCopyToClipboard();
  return (
    <li className={styles.asset}>
      <span className={styles[state]}>{id} </span>
      <Button
        variant="icon"
        title="Copy the read function usage."
        onClick={() => copy(`read('asset.${id}')`)}
        disabled={!selectedDirectory}
        className={[
          buttonStyles.button,
          buttonStyles.icon,
          copied ? buttonStyles.success : "",
        ].join(" ")}
      >
        <CopyIcon />
      </Button>
    </li>
  );
}

export function Assets() {
  const {
    assets: { get: assets },
  } = useAppFastContextFields(["assets"]);

  const { selectedDirectory, selectDirectory } = useFileSystem();

  return (
    <>
      {selectedDirectory ? null : (
        <Button variant="icon" title="Link" onClick={selectDirectory}>
          <LinkIcon />
        </Button>
      )}

      <ul id="assets" className={styles.assets}>
        {assets.map((asset, l) => {
          switch (asset.source) {
            case "local":
              return (
                <LocalAsset
                  key={asset.id}
                  {...asset}
                  selectedDirectory={selectedDirectory}
                />
              );
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
    </>
  );
}
