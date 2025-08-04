/*
 * Message-based communication utilities for cross-context (e.g., worker, iframe, main thread) messaging.
 *
 * Types:
 *   - ComEventData: Message event data with { type, payload, meta: { source, sent, operationId?, error? } }
 *
 * Functions:
 *
 * makeChannelPost(post, source): Messenger
 *   - Returns a function to send messages of a given type and payload.
 *   - If called with awaitResponse=true, returns a Promise that resolves/rejects with the handler's result or error.
 *   - All messages include meta fields: source, sent timestamp, and (for async) operationId.
 *
 * makeChannelListener(post, handlers): Listener
 *   - Returns a message event listener that dispatches to handlers by type.
 *   - Handles both sync and async handlers.
 *   - For async, posts back result or error (with operationId).
 *
 * autoBind(obj, source, handlers): { post, listener }
 *   - For an object with postMessage, returns a post function and a listener.
 *   - post: Messenger function bound to obj.postMessage.
 *   - listener: Message event listener using provided handlers.
 *
 * Features:
 *   - Async request/response with error propagation.
 *   - All messages and responses are properly meta-tagged.
 *   - Thoroughly tested for sync, async, error, and autoBind scenarios.
 */

export interface ComEventDataMeta {
  [custom: string]: any;
  operationId?: string;
  sent?: number;
  received?: number;
  processed?: number;
  answered?: number;
  source?: string;
  error?: string;
}
export interface ComEventData {
  type: string;
  payload?: any;
  meta?: ComEventDataMeta;
}

export type ComActionHandler = (
  payload?: any,
  meta?: ComEventDataMeta,
) => Promise<any> | any;

export type ComActionHandlers = Record<string, ComActionHandler>;

export type ComAnswerer = (type: ComEventData) => any;

const promises: Record<string, (err: any, result?: any) => void> = {};

export type Poster = (message: ComEventData) => any;

export type ChannelPost = (
  type: string,
  payload?: any,
  originalMeta?: ComEventDataMeta | true,
) => Promise<any>;

export type ChannelPostMaker = (poster: Poster, source: string) => ChannelPost;

export interface ComMessageEvent {
  data: ComEventData;
}

export type ComMessageEventListener = (event: ComMessageEvent) => void;

export type ChannelListenerMaker = (
  postBack: ComAnswerer,
  handlers: ComActionHandlers,
  source: string,
) => ComMessageEventListener;

export const makeChannelPost: ChannelPostMaker =
  (poster, source) => async (type, payload, originalMeta) => {
    const additions =
      originalMeta === true
        ? {
            operationId: `${Date.now()}-${source}-${(
              Math.random() * 1000000
            ).toFixed()}`,
          }
        : originalMeta != null
          ? originalMeta
          : {};
    const meta: ComEventDataMeta = {
      ...additions,
      sent: Date.now(),
      source,
    };

    if (meta.operationId) {
      const { operationId } = meta;
      const promise = new Promise((res, rej) => {
        if (promises[operationId]) {
          throw new Error(`Promise already exists for ${source}`);
        }
        promises[operationId] = (err, result) => {
          if (err) {
            rej(err);
            return;
          }
          res(result);
        };
        poster({ type, payload, meta });
      });
      return await promise;
    }

    poster({
      type,
      payload,
      meta,
    });
  };

const handleComReply = (
  payload: any,
  meta: ComEventDataMeta,
  source: string,
) => {
  if (!meta.operationId) {
    return;
  }

  const callback = promises[meta.operationId];
  if (typeof callback !== "function") {
    console.warn(Object.keys(promises), payload, meta);
    throw new Error(
      `No promise found in ${source} for operationId: ${meta.operationId} of ${meta.source}`,
    );
  }

  if (meta.error) {
    callback(new Error(`Response: ${meta.error}`));
  } else {
    callback(null, payload);
  }
};

const replyError = (
  postBack: ComAnswerer,
  err: Error | string,
  type: string,
  meta: ComEventDataMeta,
) => {
  const error =
    typeof err === "string" ? err : err.message || "Unexpected error";
  postBack({
    type: "com/reply",
    meta: {
      ...meta,
      originalType: type,
      processed: Date.now(),
      error,
    },
  });
};

export const makeChannelListener: ChannelListenerMaker =
  (postBack, handlers, source) => (event) => {
    const { type, payload, meta: originalMeta } = event.data;
    const meta: ComEventDataMeta = {
      ...originalMeta,
      received: Date.now(),
    };

    if (type === "com/reply" && meta.operationId && meta.source === source) {
      handleComReply(payload, meta, source);
      return;
    }

    const { [event.data.type]: handler } = handlers;
    if (!handler) {
      if (!meta.operationId) return;

      // replyError(postBack, `Unexepected ${type} action type for ${source}`, type, meta);
      return;
    }

    if (!meta.operationId) {
      handler(payload, meta);
      return;
    }

    handler(payload, meta)
      ?.then((result: any) =>
        postBack({
          type: "com/reply",
          payload: result,
          meta: {
            ...meta,
            originalType: type,
            processed: Date.now(),
          },
        }),
      )
      .catch((err: Error) => {
        replyError(postBack, err, type, meta);
      });
  };

export interface ComMessageChannel {
  postMessage: Poster;
  addEventListener?: (
    eventName: string,
    listener: (event: any) => void,
  ) => void;
}

export type ComChannel = ComMessageChannel;

export interface ChannelBindings {
  post: ChannelPost;
  listener: (event: ComMessageEvent) => void;
}

export const autoBind = (
  obj: ComChannel,
  source: string,
  handlers: ComActionHandlers,
) => {
  const originalPost = obj.postMessage.bind(obj);
  return {
    post: makeChannelPost(originalPost, source),
    listener: makeChannelListener(originalPost, handlers, source),
  };
};
