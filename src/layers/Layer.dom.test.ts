import { describe, expect, it, vi } from "vitest";
import Layer, { type LayerOptions } from "./Layer";

const setupScript = 'console.info("hello"); return { newData: "set" };';

let layer: Layer;

const options: LayerOptions = {
  id: "layerId",
  canvas: document.createElement("canvas"),
};

const compilationErrorListener = vi.fn((err) => {
  console.info(err.builderStr);
});

describe("instanciation", () => {
  it("takes some options", () => {
    layer = new Layer(options);
    expect(layer).toBeTruthy();
    expect(layer).toHaveProperty("setup.isAsync", false);
    expect(layer).toHaveProperty("setup.version", 1);
    expect(layer).toHaveProperty("id", options.id);
  });

  it("throws an error if no id is provided", () => {
    expect(
      () =>
        // @ts-expect-error
        new Layer({
          canvas: document.createElement("canvas"),
        }),
    ).toThrowError();
  });

  it("has a cache", () => {
    expect(layer).toHaveProperty("cache", {});
  });
});

describe("setup script", () => {
  it("is empty by default", () => {
    expect(layer).toHaveProperty("setup.code", "");
  });

  it("has a version number", () => {
    expect(layer).toHaveProperty("setup.version", 1);
  });

  it("can be set", () => {
    layer.setup.addEventListener(
      "compilationerror",
      compilationErrorListener as any,
    );
    expect(() => {
      layer.setup.code = setupScript;
    }).not.toThrowError();
    expect(compilationErrorListener).not.toHaveBeenCalled();
    expect(layer).toHaveProperty("setup.version", 2);
    expect(layer).toHaveProperty("setup.code", setupScript);
  });

  it("always executes asynchronimously", async () => {
    layer.setup.code =
      'return await (new Promise((res) => res({ newData: "set" })))';
    expect(layer).toHaveProperty("setup.isAsync", true);
    const promise = layer.execSetup();
    await expect(promise).resolves.toStrictEqual({ newData: "set" });
  });

  it("can be used to set the scripts cache", () => {
    expect(layer).toHaveProperty("cache", { newData: "set" });
  });
});

describe("animation script", () => {
  it("is empty by default", () => {
    expect(layer).toHaveProperty("animation.code", "");
  });

  it("can use the script cache", () => {
    const logListener = vi.fn();
    const code = 'cache.added = true; scriptLog("cache", cache);';
    layer.animation.code = code;
    layer.animation.addEventListener("log", logListener);
    layer.animation.addEventListener("executionerror", ((err) => {
      console.info(err);
    }) as any);
    expect(layer).toHaveProperty("animation.code", code);
    expect(layer.cache).toHaveProperty("newData", "set");
    expect(layer.execAnimation).not.toThrow();
    expect(layer.cache).toHaveProperty("newData", "set");
    expect(layer.cache).toHaveProperty("added", true);
    expect(logListener).toHaveBeenCalledWith({
      data: [["cache", { newData: "set", added: true }]],
      type: "log",
    });
    layer.animation.removeEventListener("log", logListener);
  });
});
