import type { ComEventDataMeta } from "../../utils/com";
import store from "../store";

export default function setStageSize() {
  return (size: { width: number; height: number }, meta: ComEventDataMeta) => {
    store.dispatch({ type: "setStageSize", payload: size, meta });
  };
}
