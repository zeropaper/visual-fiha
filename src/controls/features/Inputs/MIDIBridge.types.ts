export type MIDIBridgeAdapter = (
  cb: (path: string, value: any) => void,
  data: any,
) => void;
