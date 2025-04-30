declare module "mic" {
  export interface MicOptions {
    endian?: "big" | "little";
    bitwidth?: "8" | "16" | "24";
    encoding?: "signed-integer" | "unsigned-integer";
    rate?: "8000" | "16000" | "44100";
    channels?: "1" | "2";
    device?: string;
    exitOnSilence?: number;
    debug?: boolean;
    fileType?: string;
  }

  export interface MicInstance {
    start: () => void;
    stop: () => void;
    pause: () => void;
    resume: () => void;
    getAudioStream: () => NodeJS.ReadableStream;
  }

  function mic(options: MicOptions): MicInstance;

  export default mic;
}
