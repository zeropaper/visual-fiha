import type { UIDataTypes, UIMessage } from "ai";
import type { VFTools } from "./tools/types";

export type VFMessage = UIMessage<unknown, UIDataTypes, VFTools>;
