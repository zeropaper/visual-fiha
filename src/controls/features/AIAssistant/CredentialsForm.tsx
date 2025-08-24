/** biome-ignore-all lint/correctness/useUniqueElementIds: ignore */
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import styles from "./AIAssistant.module.css";

export function AIAssistantCredentialsForm({
  onClose,
}: {
  onClose?: () => void;
}) {
  return (
    <form
      className={[styles.form, styles.credentials].join(" ")}
      onSubmit={(evt) => {
        evt.preventDefault();
        const toStore = {
          openai: (evt.target as HTMLFormElement).openai.value,
          mistral: (evt.target as HTMLFormElement).mistral.value,
          ollama: (evt.target as HTMLFormElement).ollama.value,
        };
        localStorage.setItem(
          "ai-assistant-credentials",
          JSON.stringify(toStore),
        );
        onClose?.();
      }}
    >
      <div className={styles.credentialsField}>
        <label htmlFor="openai">OpenAI API Key</label>
        <Input
          type="password"
          id="openai"
          name="openai"
          placeholder="Enter your OpenAI API key"
        />
      </div>
      <div className={styles.credentialsField}>
        <label htmlFor="openai">Mistral API Key</label>
        <Input
          type="password"
          id="mistral"
          name="mistral"
          placeholder="Enter your Mistral API key"
        />
      </div>
      <div className={styles.credentialsField}>
        <label htmlFor="openai">Ollama Server</label>
        <Input
          type="text"
          id="ollama"
          name="ollama"
          placeholder="Something like http://localhost:11434"
        />
      </div>
      <div className={styles.credentialsActions}>
        <Button type="submit" title="Save credentials">
          Save Credentials
        </Button>
      </div>
    </form>
  );
}
