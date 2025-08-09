import {
  autoBind,
  type ChannelPost,
  type ComMessageEventListener,
} from "@utils/com";
import { useEffect, useRef } from "react";

export function useTakeScreenshot() {
  const comRef = useRef<{
    post: ChannelPost;
    listener: ComMessageEventListener;
  } | null>(null);

  useEffect(() => {
    const broadcastChannel = new BroadcastChannel("core");
    const com = autoBind(broadcastChannel, "takeScreenshotFn", {
      useTakeScreenshot: async (...args: any[]) => {
        console.warn("useTakeScreenshot called with args:", args);
      },
    });

    // Important: Set up the listener to handle replies
    broadcastChannel.onmessage = com.listener;

    comRef.current = com;
    return () => {
      broadcastChannel?.close();
    };
  }, []);

  return async function takeScreenshot({
    layerId,
  }: {
    layerId: string;
  }): Promise<string> {
    if (!comRef.current) {
      throw new Error("Screenshot tool is not initialized");
    }

    const { post } = comRef.current;
    const response = await post(
      "takeScreenshot",
      { layerId, displayName: "controls-display" },
      true,
    );
    if (response.meta?.error) {
      throw new Error(response.meta.error);
    }

    return response;
  };
}
