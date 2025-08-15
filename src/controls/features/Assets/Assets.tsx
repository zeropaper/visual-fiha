import { useAppFastContextFields } from "@contexts/ControlsContext";
import { useFileSystem } from "@controls/contexts/FileSystemContext";
import { useCopyToClipboard } from "@controls/hooks/useCopyToClipboard";
import { Button, buttonStyles } from "@ui/Button";
import { CopyIcon, LinkIcon } from "lucide-react";
import type { AssetConfig } from "src/types";
import styles from "./Assets.module.css";

function AssetId({ id, state }: { id: string; state: string }) {
  return (
    <span
      className={[styles[state as keyof typeof styles], styles.id].join(" ")}
    >
      {id}
    </span>
  );
}

function Asset({ id, state, source }: AssetConfig) {
  const [copied, copy] = useCopyToClipboard();
  return (
    <li className={styles.asset}>
      <Button
        variant="icon"
        title="Copy the read function usage."
        onClick={() => copy(`read('asset.${id}')`)}
        className={[
          buttonStyles.button,
          buttonStyles.icon,
          copied ? buttonStyles.success : "",
        ].join(" ")}
      >
        <CopyIcon />
      </Button>
      <span className={styles.source}>{source}</span>
      <AssetId id={id} state={state || "idle"} />
    </li>
  );
}

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
      <span className={styles.source}>local</span>
      <AssetId id={id} state={state || "idle"} />
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
        {assets
          .sort((a, b) => {
            if (a.id > b.id) return 1;
            if (a.id < b.id) return -1;
            return 0;
          })
          .map((asset, l) => {
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
                return <Asset key={asset.id} {...asset} />;
            }
          })}
      </ul>
    </>
  );
}
