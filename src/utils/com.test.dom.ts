import { describe, expect, it, vi } from "vitest";
import * as com from "./com";

// const expectedError = new Error('Expected');

const handlers = {
  actionA: vi.fn(() => {}),
  actionB: vi.fn(async () => "B"),
  actionC: vi.fn(async () => {
    throw new Error("Expected");
  }),
};

describe("com.messenger", () => {
  it("properly use the posting function", () => {
    const post = vi.fn();
    const messenger = com.makeChannelPost(post, "side-1");
    void messenger("actionA");

    expect(post).toHaveBeenCalledTimes(1);

    const [args] = post.mock.calls;
    expect(args).toHaveLength(1);
    expect(args[0]).toHaveProperty("type", "actionA");
    expect(args[0]).toHaveProperty("payload");
    expect(args[0]).toHaveProperty("meta.source", "side-1");
    expect(args[0]).toHaveProperty("meta.sent");
    expect(args[0]).not.toHaveProperty("meta.operationId");
  });

  it("can use async", async () => {
    const post = vi.fn();
    const messenger = com.makeChannelPost(post, "side-1");

    const promise = messenger("actionB", {}, true);
    expect(post).toHaveBeenCalledTimes(1);
    expect(promise).toHaveProperty("then");

    const [args] = post.mock.calls;

    expect(args).toHaveLength(1);
    expect(args[0]).toHaveProperty("type", "actionB");
    expect(args[0]).toHaveProperty("payload");
    expect(args[0]).toHaveProperty("meta.source", "side-1");
    expect(args[0]).toHaveProperty("meta.sent");
    expect(args[0]).toHaveProperty("meta.operationId");

    const postBack = vi.fn();
    const listener2 = com.makeChannelListener(postBack, handlers, "side-2");

    const listener1 = com.makeChannelListener(post, {}, "side-1");

    listener2({
      data: { ...args[0] },
    } as MessageEvent<com.ComEventData>);

    await new Promise((res) => setTimeout(res, 1));
    expect(postBack).toHaveBeenCalledTimes(1);

    listener1({
      data: postBack.mock.calls[0][0],
    } as MessageEvent<com.ComEventData>);

    await new Promise((res) => setTimeout(res, 1));
    await expect(promise).resolves.toBe("B");
  });

  it("handles async error", async () => {
    const post = vi.fn();
    const messenger = com.makeChannelPost(post, "side-1");

    const listener1 = com.makeChannelListener(post, {}, "side-1");

    const postBack = vi.fn();
    const listener2 = com.makeChannelListener(postBack, handlers, "side-2");
    const promise: Promise<any> = messenger("actionC", {}, true);

    const [args] = post.mock.calls;

    listener2({
      data: { ...args[0] },
    } as MessageEvent<com.ComEventData>);

    expect(post).toHaveBeenCalledTimes(1);
    expect(promise).toHaveProperty("then");

    await new Promise((res) => setTimeout(res, 1));
    expect(postBack).toHaveBeenCalledTimes(1);

    expect(postBack.mock.calls[0][0]).toHaveProperty("meta.error", "Expected");
    const postBackEvent = {
      data: postBack.mock.calls[0][0],
    } as MessageEvent<com.ComEventData>;

    listener1(postBackEvent);

    await expect(promise).rejects.toThrow("Expected");
  });
});

describe("com.autoBind", () => {
  it("creates the post and listener", async () => {
    let post: com.ChannelPost;
    let listener: com.ComMessageEventListener;
    const obj = {
      postMessage: vi.fn(),
    };

    expect(() => {
      const api = com.autoBind(obj, "some-name", handlers);
      post = api.post;
      listener = api.listener;

      expect(typeof post).toBe("function");
      expect(typeof listener).toBe("function");

      void post("actionA");
    }).not.toThrow();

    expect(obj.postMessage).toHaveBeenCalledTimes(1);

    // const postPromise = post('actionB', null, true);
    // const [[response]] = obj.postMessage.mock.calls;
    // listener({
    //   data: {
    //     ...response,
    //   },
    // } as MessageEvent<com.ComEventData>);
    // await expect(postPromise).resolves.toBe('B');

    // expect(obj.postMessage).toHaveBeenCalledTimes(2);
  });
});
