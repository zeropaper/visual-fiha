import { ComEventData } from '../types';
import * as com from './com';

// const expectedError = new Error('Expected');

const handlers = {
  actionA: jest.fn(() => { }),
  actionB: jest.fn(async () => 'B'),
  actionC: jest.fn(async () => {
    throw new Error('Expected');
  }),
};

describe('com.messenger', () => {
  it('properly use the posting function', () => {
    const post = jest.fn();
    const messenger = com.makeChannelPost(post, 'side-1');
    messenger('actionA');

    expect(post).toHaveBeenCalledTimes(1);

    const [args] = post.mock.calls;
    expect(args).toHaveLength(1);
    expect(args[0]).toHaveProperty('type', 'actionA');
    expect(args[0]).toHaveProperty('payload');
    expect(args[0]).toHaveProperty('meta.source', 'side-1');
    expect(args[0]).toHaveProperty('meta.sent');
    expect(args[0]).not.toHaveProperty('meta.operationId');
  });

  it('can use async', async () => {
    const post = jest.fn();
    const messenger = com.makeChannelPost(post, 'side-1');

    const promise = messenger('actionB', {}, true);
    expect(post).toHaveBeenCalledTimes(1);
    expect(promise).toHaveProperty('then');

    const [args] = post.mock.calls;

    expect(args).toHaveLength(1);
    expect(args[0]).toHaveProperty('type', 'actionB');
    expect(args[0]).toHaveProperty('payload');
    expect(args[0]).toHaveProperty('meta.source', 'side-1');
    expect(args[0]).toHaveProperty('meta.sent');
    expect(args[0]).toHaveProperty('meta.operationId');

    const postBack = jest.fn();
    const listener2 = com.makeChannelListener(postBack, handlers);

    const listener1 = com.makeChannelListener(post, {});

    listener2({
      data: { ...args[0] },
    } as MessageEvent<ComEventData>);

    await new Promise((res) => setTimeout(res, 1));
    expect(postBack).toHaveBeenCalledTimes(1);

    listener1({
      data: postBack.mock.calls[0][0],
    } as MessageEvent<ComEventData>);

    await new Promise((res) => setTimeout(res, 1));
    await expect(promise).resolves.toBe('B');
  });

  it('handles async error', async () => {
    const post = jest.fn();
    const messenger = com.makeChannelPost(post, 'side-1');

    const listener1 = com.makeChannelListener(post, {});

    const postBack = jest.fn();
    const listener2 = com.makeChannelListener(postBack, handlers);
    const promise: Promise<any> = messenger('actionC', {}, true);

    const [args] = post.mock.calls;

    listener2({
      data: { ...args[0] },
    } as MessageEvent<ComEventData>);

    expect(post).toHaveBeenCalledTimes(1);
    expect(promise).toHaveProperty('then');

    await new Promise((res) => setTimeout(res, 1));
    expect(postBack).toHaveBeenCalledTimes(1);

    expect(postBack.mock.calls[0][0]).toHaveProperty('meta.error', 'Expected');
    const postBackEvent = {
      data: postBack.mock.calls[0][0],
    } as MessageEvent<ComEventData>;

    listener1(postBackEvent);

    await expect(promise).rejects.toThrow('Expected');
  });
});

describe('com.autoBind', () => {
  it('creates the post and listener', async () => {
    let post: com.ChannelPost;
    let listener: com.ComMessageEventListener;
    const obj = {
      postMessage: jest.fn(),
    };

    expect(() => {
      const api = com.autoBind(obj, 'some-name', handlers);
      post = api.post;
      listener = api.listener;
    }).not.toThrow();

    expect(typeof post).toBe('function');
    expect(typeof listener).toBe('function');

    post('actionA');

    expect(obj.postMessage).toHaveBeenCalledTimes(1);

    // const postPromise = post('actionB', null, true);
    // const [[response]] = obj.postMessage.mock.calls;
    // listener({
    //   data: {
    //     ...response,
    //   },
    // } as MessageEvent<ComEventData>);
    // await expect(postPromise).resolves.toBe('B');

    // expect(obj.postMessage).toHaveBeenCalledTimes(2);
  });
});
