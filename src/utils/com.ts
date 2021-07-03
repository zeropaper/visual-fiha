import type { ComEventData, ComEventDataMeta } from '../types';

export interface ComActionHandler {
  (payload?: any, meta?: ComEventDataMeta): Promise<any> | any
}

export type ComActionHandlers = {
  [action: string]: ComActionHandler;
};

export interface ComAnswerer {
  (action: ComEventData): any;
}

const promises: {
  [operationId: string]: (err: any, result?: any) => void;
} = {};

export interface Poster {
  (message: ComEventData): any;
}

export interface MessengerPoster {
  (action: string, payload?: any, originalMeta?: ComEventDataMeta | true): Promise<any>
}

export interface ChannelPostMaker {
  (poster: Poster, source: string): MessengerPoster;
}

export interface ComMessageEventListener {
  (event: MessageEvent<ComEventData>): void
}

export interface ChannelListenerMaker {
  (postBack: ComAnswerer, handlers: ComActionHandlers): ComMessageEventListener;
}

// eslint-disable-next-line max-len
export const makeChannelPost: ChannelPostMaker = (poster, source) => (action, payload, originalMeta) => {
  const meta: ComEventDataMeta = {
    ...(originalMeta === true ? {
      operationId: `${Date.now()}-${source}-${(Math.random() * 1000000).toFixed()}`,
    } : originalMeta || {}),
    sent: Date.now(),
    source,
  };

  if (meta.operationId) {
    const { operationId } = meta;
    const promise = new Promise((res, rej) => {
      if (promises[operationId]) throw new Error('Promise already exists');
      promises[operationId] = (err, result) => {
        if (err) {
          rej(err);
          return;
        }
        res(result);
      };
      poster({ action, payload, meta });
    });
    return promise;
  }

  poster({
    action,
    payload,
    meta,
  });
  return Promise.resolve();
};

const handleComReply = (payload: any, meta: ComEventDataMeta) => {
  if (!meta.operationId) {
    return;
  }

  if (typeof promises[meta.operationId] !== 'function') {
    throw new Error('No promise found');
  }

  const cb = promises[meta.operationId];
  if (meta.error) {
    cb(new Error(meta.error));
  } else {
    cb(null, payload);
  }
};

// eslint-disable-next-line max-len
const replyError = (postBack: ComAnswerer, err: Error | string, action: string, meta: ComEventDataMeta) => {
  const error = typeof err === 'string' ? err : err.message || 'Unexpected error';
  postBack({
    action: 'com/reply',
    meta: {
      ...meta,
      originalAction: action,
      processed: Date.now(),
      error,
    },
  });
};

export const makeChannelListener: ChannelListenerMaker = (postBack, handlers) => (event) => {
  const {
    action,
    payload,
    meta: originalMeta,
  } = event.data;
  const meta: ComEventDataMeta = {
    ...originalMeta,
    received: Date.now(),
  };

  if (action === 'com/reply' && meta.operationId) {
    handleComReply(payload, meta);
    return;
  }

  const { [event.data.action]: handler } = handlers;
  if (!handler) {
    const err = `Unexepected ${action} action`;

    if (!meta.operationId) return;

    replyError(postBack, err, action, meta);
    return;
  }

  if (!meta.operationId) {
    handler(payload, meta);
    return;
  }

  handler(payload, meta)
    .then((result: any) => postBack({
      action: 'com/reply',
      payload: result,
      meta: {
        ...meta,
        originalAction: action,
        processed: Date.now(),
      },
    }))
    .catch((err: Error) => replyError(postBack, err, action, meta));
};

export interface ComMessageChannel {
  postMessage: Poster;
  addEventListener?: (eventName: string, listener: EventListener) => void;
}

export type ComChannel = ComMessageChannel;

export const autoBind = (obj: ComChannel, source: string, handlers: ComActionHandlers) => {
  const originalPost = obj.postMessage.bind(obj) as Poster;
  return {
    post: makeChannelPost(originalPost, source),
    listener: makeChannelListener(originalPost, handlers),
  };
};
