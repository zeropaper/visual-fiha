import type { ComEventData, ComEventDataMeta } from '../types';

export interface ComActionHandler {
  (payload?: any, meta?: ComEventDataMeta): Promise<any> | any
}

export type ComActionHandlers = {
  [type: string]: ComActionHandler;
};

export interface ComAnswerer {
  (type: ComEventData): any;
}

const promises: {
  [operationId: string]: (err: any, result?: any) => void;
} = {};

export interface Poster {
  (message: ComEventData): any;
}

export interface ChannelPost {
  (type: string, payload?: any, originalMeta?: ComEventDataMeta | true): Promise<any>
}

export interface ChannelPostMaker {
  (poster: Poster, source: string): ChannelPost;
}

export interface ComMessageEvent {
  data: ComEventData
}

export interface ComMessageEventListener {
  (event: ComMessageEvent): void
}

export interface ChannelListenerMaker {
  (postBack: ComAnswerer, handlers: ComActionHandlers): ComMessageEventListener;
}

// eslint-disable-next-line max-len
export const makeChannelPost: ChannelPostMaker = (poster, source) => (type, payload, originalMeta) => {
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
      poster({ type, payload, meta });
    });
    return promise;
  }

  poster({
    type,
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
const replyError = (postBack: ComAnswerer, err: Error | string, type: string, meta: ComEventDataMeta) => {
  const error = typeof err === 'string' ? err : err.message || 'Unexpected error';
  postBack({
    type: 'com/reply',
    meta: {
      ...meta,
      originalType: type,
      processed: Date.now(),
      error,
    },
  });
};

export const makeChannelListener: ChannelListenerMaker = (postBack, handlers) => (event) => {
  const {
    type,
    payload,
    meta: originalMeta,
  } = event.data;
  const meta: ComEventDataMeta = {
    ...originalMeta,
    received: Date.now(),
  };

  if (type === 'com/reply' && meta.operationId) {
    handleComReply(payload, meta);
    return;
  }

  const { [event.data.type]: handler } = handlers;
  if (!handler) {
    const err = `Unexepected ${type} action type`;

    if (!meta.operationId) return;

    replyError(postBack, err, type, meta);
    return;
  }

  if (!meta.operationId) {
    handler(payload, meta);
    return;
  }

  handler(payload, meta)
    .then((result: any) => postBack({
      type: 'com/reply',
      payload: result,
      meta: {
        ...meta,
        originalType: type,
        processed: Date.now(),
      },
    }))
    .catch((err: Error) => replyError(postBack, err, type, meta));
};

export interface ComMessageChannel {
  postMessage: Poster;
  addEventListener?: (eventName: string, listener: (event: any) => void) => void;
}

export type ComChannel = ComMessageChannel;

export interface ChannelBindings {
  post: ChannelPost;
  listener: (event: ComMessageEvent) => void;
}

export const autoBind = (obj: ComChannel, source: string, handlers: ComActionHandlers) => {
  const originalPost = obj.postMessage.bind(obj) as Poster;
  return {
    post: makeChannelPost(originalPost, source),
    listener: makeChannelListener(originalPost, handlers),
  };
};
