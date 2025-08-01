# WebGPU Shaders Layer Implementation Plan

This document outlines the implementation plan for adding a WebGPU shaders layer type to Visual Fiha, based on the existing Canvas2D and ThreeJS layer implementations.

## Overview

The WebGPU layer will provide a modern, high-performance graphics API for creating complex shaders and GPU-accelerated visual effects. Unlike the existing layers that focus on 2D canvas operations or 3D scene management, the WebGPU layer will expose low-level GPU programming capabilities through compute and render shaders.

### Key Features

- **Vertex and Fragment Shaders**: Support for custom WGSL (WebGPU Shading Language) shaders
- **Compute Shaders**: GPU-accelerated computation for complex visual effects
- **Buffer Management**: Efficient handling of vertex, uniform, and storage buffers
- **Texture Operations**: Advanced texture manipulation and multi-pass rendering
- **Real-time Performance**: Direct GPU access for maximum performance

## Architecture Analysis

### Existing Layer Structure

Based on the Canvas2D and ThreeJS implementations, all layers follow this pattern:

1. **Base Layer Class**: Extends `Scriptable` from `../utils/Scriptable`
2. **Layer Options Interface**: Extends `LayerOptions` with layer-specific options
3. **API Construction**: Combines utilities and layer-specific tools in the constructor
4. **Canvas Integration**: Uses HTMLCanvasElement or OffscreenCanvas for rendering
5. **Type System**: Readonly `type` property for layer identification

### WebGPU Integration Points

The WebGPU layer will need to integrate with:

1. **Visual Fiha Messaging System**: Using `com.ts` utilities for cross-worker communication
2. **Type System**: Update `LayerConfig` union type in `src/types.ts`
3. **Display Worker**: Add WebGPU layer processing in `Display.worker.ts`
4. **Script Editor**: Monaco Editor integration with WGSL syntax highlighting
5. **Layer Management**: Controls UI for managing WebGPU-specific properties

## Implementation Plan

### Phase 1: Core Layer Structure

#### 1.1 Create WebGPU Layer Class

```typescript
// src/layers/WebGPU/WebGPULayer.ts
import * as mathTools from "../../utils/mathTools";
import miscTools from "../../utils/miscTools";
import Layer, { type LayerOptions } from "../Layer";
import webgpuTools, { type WebGPUContext } from "./webgpuTools";

export interface WebGPULayerOptions extends LayerOptions {
  powerPreference?: "low-power" | "high-performance";
  requiredFeatures?: GPUFeatureName[];
  requiredLimits?: Record<string, GPUSize64>;
}

export default class WebGPULayer extends Layer {
  readonly type = "webgpu";

  constructor(options: WebGPULayerOptions) {
    super(options);
    this.#initializeWebGPU(options);
  }

  #adapter: GPUAdapter | null = null;
  #device: GPUDevice | null = null;
  #context: GPUCanvasContext | null = null;
  #format: GPUTextureFormat = "bgra8unorm";

  async #initializeWebGPU(options: WebGPULayerOptions) {
    if (!navigator.gpu) {
      throw new Error("WebGPU not supported in this browser");
    }

    this.#adapter = await navigator.gpu.requestAdapter({
      powerPreference: options.powerPreference || "high-performance",
    });

    if (!this.#adapter) {
      throw new Error("Failed to request WebGPU adapter");
    }

    this.#device = await this.#adapter.requestDevice({
      requiredFeatures: options.requiredFeatures || [],
      requiredLimits: options.requiredLimits || {},
    });

    this.#context = this.canvas.getContext("webgpu") as GPUCanvasContext;
    
    if (!this.#context) {
      throw new Error("Failed to get WebGPU context");
    }

    this.#format = navigator.gpu.getPreferredCanvasFormat();
    
    this.#context.configure({
      device: this.#device,
      format: this.#format,
      alphaMode: "premultiplied",
    });

    this.api = {
      ...mathTools,
      ...miscTools,
      ...super.api,
      ...webgpuTools(this.#device, this.#context, this.#format),
    };
  }

  get device() {
    return this.#device;
  }

  get context() {
    return this.#context;
  }

  get adapter() {
    return this.#adapter;
  }

  get format() {
    return this.#format;
  }

  destroy() {
    this.#device?.destroy();
  }
}
```

#### 1.2 Create WebGPU Tools Module

```typescript
// src/layers/WebGPU/webgpuTools.ts
export interface WebGPUContext {
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
}

export type createBuffer = (
  data: Float32Array | Uint32Array | Uint16Array,
  usage: GPUBufferUsageFlags,
  label?: string
) => GPUBuffer;

export type createTexture = (
  width: number,
  height: number,
  format?: GPUTextureFormat,
  usage?: GPUTextureUsageFlags,
  label?: string
) => GPUTexture;

export type createShaderModule = (
  code: string,
  label?: string
) => GPUShaderModule;

export type createRenderPipeline = (
  vertexShader: GPUShaderModule,
  fragmentShader: GPUShaderModule,
  vertexBufferLayout?: GPUVertexBufferLayout[],
  label?: string
) => GPURenderPipeline;

export type createComputePipeline = (
  computeShader: GPUShaderModule,
  label?: string
) => GPUComputePipeline;

export type beginRenderPass = (
  colorAttachments?: GPURenderPassColorAttachment[],
  depthStencilAttachment?: GPURenderPassDepthStencilAttachment,
  label?: string
) => GPURenderPassEncoder;

export type beginComputePass = (
  label?: string
) => GPUComputePassEncoder;

export type submitCommandBuffer = (
  commandBuffer: GPUCommandBuffer
) => void;

export type width = () => number;
export type height = () => number;

export interface WebGPUAPI {
  // Canvas utilities
  width: width;
  height: height;
  
  // Buffer operations
  createBuffer: createBuffer;
  createTexture: createTexture;
  
  // Shader operations
  createShaderModule: createShaderModule;
  createRenderPipeline: createRenderPipeline;
  createComputePipeline: createComputePipeline;
  
  // Render passes
  beginRenderPass: beginRenderPass;
  beginComputePass: beginComputePass;
  submitCommandBuffer: submitCommandBuffer;
  
  // WebGPU objects
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
  
  // Command encoding
  createCommandEncoder: () => GPUCommandEncoder;
  
  // Built-in vertex layouts
  createQuadVertices: () => Float32Array;
  createQuadIndices: () => Uint16Array;
}

export default function webgpuTools(
  device: GPUDevice,
  context: GPUCanvasContext,
  format: GPUTextureFormat
): WebGPUAPI {
  const width = () => context.canvas.width;
  const height = () => context.canvas.height;

  const createBuffer: createBuffer = (data, usage, label = "buffer") => {
    const buffer = device.createBuffer({
      size: data.byteLength,
      usage,
      label,
    });
    device.queue.writeBuffer(buffer, 0, data);
    return buffer;
  };

  const createTexture: createTexture = (
    width,
    height,
    textureFormat = format,
    usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    label = "texture"
  ) => {
    return device.createTexture({
      size: [width, height],
      format: textureFormat,
      usage,
      label,
    });
  };

  const createShaderModule: createShaderModule = (code, label = "shader") => {
    return device.createShaderModule({
      code,
      label,
    });
  };

  const createRenderPipeline: createRenderPipeline = (
    vertexShader,
    fragmentShader,
    vertexBufferLayout = [],
    label = "render-pipeline"
  ) => {
    return device.createRenderPipeline({
      label,
      layout: "auto",
      vertex: {
        module: vertexShader,
        entryPoint: "vs_main",
        buffers: vertexBufferLayout,
      },
      fragment: {
        module: fragmentShader,
        entryPoint: "fs_main",
        targets: [{ format }],
      },
      primitive: {
        topology: "triangle-list",
      },
    });
  };

  const createComputePipeline: createComputePipeline = (
    computeShader,
    label = "compute-pipeline"
  ) => {
    return device.createComputePipeline({
      label,
      layout: "auto",
      compute: {
        module: computeShader,
        entryPoint: "cs_main",
      },
    });
  };

  const beginRenderPass: beginRenderPass = (
    colorAttachments = [
      {
        view: context.getCurrentTexture().createView(),
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
    depthStencilAttachment,
    label = "render-pass"
  ) => {
    const commandEncoder = device.createCommandEncoder({ label });
    return commandEncoder.beginRenderPass({
      label,
      colorAttachments,
      depthStencilAttachment,
    });
  };

  const beginComputePass: beginComputePass = (label = "compute-pass") => {
    const commandEncoder = device.createCommandEncoder({ label });
    return commandEncoder.beginComputePass({ label });
  };

  const submitCommandBuffer: submitCommandBuffer = (commandBuffer) => {
    device.queue.submit([commandBuffer]);
  };

  const createCommandEncoder = () => device.createCommandEncoder();

  const createQuadVertices = () => new Float32Array([
    // Position (x, y)   UV (u, v)
    -1.0, -1.0,         0.0, 1.0,  // Bottom-left
     1.0, -1.0,         1.0, 1.0,  // Bottom-right
     1.0,  1.0,         1.0, 0.0,  // Top-right
    -1.0,  1.0,         0.0, 0.0,  // Top-left
  ]);

  const createQuadIndices = () => new Uint16Array([
    0, 1, 2,  // First triangle
    2, 3, 0   // Second triangle
  ]);

  return {
    width,
    height,
    createBuffer,
    createTexture,
    createShaderModule,
    createRenderPipeline,
    createComputePipeline,
    beginRenderPass,
    beginComputePass,
    submitCommandBuffer,
    createCommandEncoder,
    createQuadVertices,
    createQuadIndices,
    device,
    context,
    format,
  };
}

declare global {
  const device: GPUDevice;
  const context: GPUCanvasContext;
  const format: GPUTextureFormat;
  const width: width;
  const height: height;
  const createBuffer: createBuffer;
  const createTexture: createTexture;
  const createShaderModule: createShaderModule;
  const createRenderPipeline: createRenderPipeline;
  const createComputePipeline: createComputePipeline;
  const beginRenderPass: beginRenderPass;
  const beginComputePass: beginComputePass;
  const submitCommandBuffer: submitCommandBuffer;
  const createCommandEncoder: () => GPUCommandEncoder;
  const createQuadVertices: () => Float32Array;
  const createQuadIndices: () => Uint16Array;
}
```

### Phase 2: Type System Integration

#### 2.1 Update Layer Configuration Types

```typescript
// src/types.ts - Add to LayerConfig union type
export type LayerConfig = Prettify<
  (
    | {
        type: "canvas";
      }
    | {
        type: "threejs";
      }
    | {
        type: "webgpu";
        powerPreference?: "low-power" | "high-performance";
        requiredFeatures?: string[];
        requiredLimits?: Record<string, number>;
      }
  ) &
    LayerConfigBase
>;
```

#### 2.2 Update Display Worker

```typescript
// src/display/Display.worker.ts - Add import and case
import WebGPULayer from "../layers/WebGPU/WebGPULayer";

// Update type annotation
let layer: Canvas2DLayer | ThreeJSLayer | WebGPULayer | null = null;

// Add case in switch statement
switch (options.type) {
  case "canvas":
    layer = new Canvas2DLayer(completeOptions);
    break;
  case "threejs":
    layer = new ThreeJSLayer(completeOptions);
    break;
  case "webgpu":
    layer = new WebGPULayer(completeOptions);
    break;
  default:
    console.warn(`[display worker] Layer type is not supported`, options);
    break;
}
```

#### 2.3 Update Display Types

```typescript
// src/display/types.ts
import type WebGPULayer from "../layers/WebGPU/WebGPULayer";

export interface DisplayState extends Omit<RuntimeData, "layers"> {
  id: string;
  layers: Array<Canvas2DLayer | ThreeJSLayer | WebGPULayer>;
}
```

### Phase 3: Editor Integration

#### 3.1 Create WGSL TypeScript Definitions

```typescript
// src/layers/WebGPU/webgpuTools.editor-types.txt
declare const device: GPUDevice;
declare const context: GPUCanvasContext;
declare const format: GPUTextureFormat;

declare const width: () => number;
declare const height: () => number;

declare const createBuffer: (
  data: Float32Array | Uint32Array | Uint16Array,
  usage: GPUBufferUsageFlags,
  label?: string
) => GPUBuffer;

declare const createTexture: (
  width: number,
  height: number,
  format?: GPUTextureFormat,
  usage?: GPUTextureUsageFlags,
  label?: string
) => GPUTexture;

declare const createShaderModule: (
  code: string,
  label?: string
) => GPUShaderModule;

declare const createRenderPipeline: (
  vertexShader: GPUShaderModule,
  fragmentShader: GPUShaderModule,
  vertexBufferLayout?: GPUVertexBufferLayout[],
  label?: string
) => GPURenderPipeline;

declare const createComputePipeline: (
  computeShader: GPUShaderModule,
  label?: string
) => GPUComputePipeline;

declare const beginRenderPass: (
  colorAttachments?: GPURenderPassColorAttachment[],
  depthStencilAttachment?: GPURenderPassDepthStencilAttachment,
  label?: string
) => GPURenderPassEncoder;

declare const beginComputePass: (
  label?: string
) => GPUComputePassEncoder;

declare const submitCommandBuffer: (
  commandBuffer: GPUCommandBuffer
) => void;

declare const createCommandEncoder: () => GPUCommandEncoder;
declare const createQuadVertices: () => Float32Array;
declare const createQuadIndices: () => Uint16Array;

// WGSL shader template literals
declare function wgsl(template: TemplateStringsArray, ...substitutions: any[]): string;

// Common WebGPU constants
declare const GPUBufferUsage: {
  readonly MAP_READ: 0x0001;
  readonly MAP_WRITE: 0x0002;
  readonly COPY_SRC: 0x0004;
  readonly COPY_DST: 0x0008;
  readonly INDEX: 0x0010;
  readonly VERTEX: 0x0020;
  readonly UNIFORM: 0x0040;
  readonly STORAGE: 0x0080;
  readonly INDIRECT: 0x0100;
  readonly QUERY_RESOLVE: 0x0200;
};

declare const GPUTextureUsage: {
  readonly COPY_SRC: 0x01;
  readonly COPY_DST: 0x02;
  readonly TEXTURE_BINDING: 0x04;
  readonly STORAGE_BINDING: 0x08;
  readonly RENDER_ATTACHMENT: 0x10;
};
```

#### 3.2 Update Script Editor

```typescript
// src/controls/features/ScriptEditor/ScriptEditor.extraLibs.ts
import webgpuTypes from "@layers/WebGPU/webgpuTools.editor-types.txt?raw";

export const extraLibs: Record<
  LayerConfig["type"],
  Record<"setup" | "animation", [string, string][]>
> = {
  canvas: {
    setup: [[canvasTypes, "ts:canvas.d.ts"]],
    animation: [[canvasTypes, "ts:canvas.d.ts"]],
  },
  threejs: {
    setup: [
      [threeTypes, "ts:three.d.ts"],
      [threeBundleTypes, "file://node_modules/@types/three/index.d.ts"],
    ],
    animation: [
      [threeTypes, "ts:three.d.ts"],
      [threeBundleTypes, "file://node_modules/@types/three/index.d.ts"],
    ],
  },
  webgpu: {
    setup: [
      [webgpuTypes, "ts:webgpu.d.ts"],
      ["declare module 'webgpu';", "file://node_modules/@webgpu/types/index.d.ts"],
    ],
    animation: [
      [webgpuTypes, "ts:webgpu.d.ts"],
      ["declare module 'webgpu';", "file://node_modules/@webgpu/types/index.d.ts"],
    ],
  },
};
```

#### 3.3 Add WGSL Language Support

```typescript
// src/controls/features/ScriptEditor/ScriptEditor.tsx - Add WGSL support
import * as monaco from "monaco-editor";

// Register WGSL language
monaco.languages.register({ id: "wgsl" });

monaco.languages.setMonarchTokensProvider("wgsl", {
  tokenizer: {
    root: [
      [/\b(fn|var|let|const|struct|return|if|else|for|while|loop|break|continue)\b/, "keyword"],
      [/\b(f32|i32|u32|bool|vec2|vec3|vec4|mat2x2|mat3x3|mat4x4|array|texture_2d|sampler)\b/, "type"],
      [/\b(vertex|fragment|compute|workgroup_size|location|binding|group)\b/, "attribute"],
      [/[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?[fFhH]?/, "number"],
      [/"([^"\\]|\\.)*$/, "string.invalid"],
      [/"/, "string", "@string"],
      [/\/\/.*$/, "comment"],
      [/\/\*/, "comment", "@comment"],
    ],
    string: [
      [/[^\\"]+/, "string"],
      [/"/, "string", "@pop"]
    ],
    comment: [
      [/[^\/*]+/, "comment"],
      [/\*\//, "comment", "@pop"],
      [/[\/*]/, "comment"]
    ]
  }
});

monaco.languages.setLanguageConfiguration("wgsl", {
  comments: {
    lineComment: "//",
    blockComment: ["/*", "*/"]
  },
  brackets: [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"]
  ],
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' }
  ]
});
```

### Phase 4: Layer Management UI

#### 4.1 Add WebGPU Option to Layer Creation

```typescript
// src/controls/features/Layers/Layers.tsx - Add WebGPU option
<Select name="type">
  <option value="" disabled>
    Select type
  </option>
  <option value="canvas">Canvas</option>
  <option value="threejs">ThreeJS</option>
  <option value="webgpu">WebGPU</option>
</Select>
```

#### 4.2 WebGPU-Specific Configuration

```typescript
// src/controls/features/Layers/WebGPULayerConfig.tsx
import { Select } from "@ui/Select";
import { Checkbox } from "@ui/Checkbox";

interface WebGPULayerConfigProps {
  layerId: string;
  powerPreference: "low-power" | "high-performance";
  requiredFeatures: string[];
  onUpdate: (config: Partial<WebGPULayerOptions>) => void;
}

export function WebGPULayerConfig({
  layerId,
  powerPreference,
  requiredFeatures,
  onUpdate,
}: WebGPULayerConfigProps) {
  return (
    <div className="webgpu-config">
      <Select
        value={powerPreference}
        onChange={(e) => onUpdate({ powerPreference: e.target.value as any })}
      >
        <option value="low-power">Low Power</option>
        <option value="high-performance">High Performance</option>
      </Select>
      
      <fieldset>
        <legend>Required Features</legend>
        {[
          "depth-clip-control",
          "depth32float-stencil8",
          "texture-compression-bc",
          "texture-compression-etc2",
          "texture-compression-astc",
          "timestamp-query",
          "indirect-first-instance",
        ].map((feature) => (
          <Checkbox
            key={feature}
            checked={requiredFeatures.includes(feature)}
            onChange={(checked) => {
              const updated = checked
                ? [...requiredFeatures, feature]
                : requiredFeatures.filter((f) => f !== feature);
              onUpdate({ requiredFeatures: updated });
            }}
          >
            {feature}
          </Checkbox>
        ))}
      </fieldset>
    </div>
  );
}
```

### Phase 5: Testing

#### 5.1 Unit Tests

```typescript
// src/layers/WebGPU/WebGPULayer.test.dom.ts
import { describe, it, expect, vi, beforeAll } from "vitest";
import WebGPULayer from "./WebGPULayer";
import type { WebGPULayerOptions } from "./WebGPULayer";

// Mock WebGPU API
const mockAdapter = {
  requestDevice: vi.fn().mockResolvedValue({
    createBuffer: vi.fn(),
    createTexture: vi.fn(),
    createShaderModule: vi.fn(),
    createRenderPipeline: vi.fn(),
    createComputePipeline: vi.fn(),
    createCommandEncoder: vi.fn(),
    queue: { submit: vi.fn(), writeBuffer: vi.fn() },
    destroy: vi.fn(),
  }),
};

const mockGPU = {
  requestAdapter: vi.fn().mockResolvedValue(mockAdapter),
  getPreferredCanvasFormat: vi.fn().mockReturnValue("bgra8unorm"),
};

const mockContext = {
  configure: vi.fn(),
  getCurrentTexture: vi.fn().mockReturnValue({
    createView: vi.fn(),
  }),
};

beforeAll(() => {
  // @ts-ignore
  global.navigator = {
    gpu: mockGPU,
  };

  // Mock canvas context
  HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((type) => {
    if (type === "webgpu") return mockContext;
    return null;
  });
});

const setupScript = `
// Initialize WebGPU shader
const vertexShader = createShaderModule(\`
  @vertex
  fn vs_main(@location(0) position: vec2<f32>) -> @builtin(position) vec4<f32> {
    return vec4<f32>(position, 0.0, 1.0);
  }
\`);

const fragmentShader = createShaderModule(\`
  @fragment
  fn fs_main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0);
  }
\`);

cache.pipeline = createRenderPipeline(vertexShader, fragmentShader);
cache.vertices = createQuadVertices();
cache.indices = createQuadIndices();
cache.vertexBuffer = createBuffer(cache.vertices, GPUBufferUsage.VERTEX);
cache.indexBuffer = createBuffer(cache.indices, GPUBufferUsage.INDEX);
`;

const animationScript = `
const encoder = createCommandEncoder();
const renderPass = encoder.beginRenderPass();
renderPass.setPipeline(cache.pipeline);
renderPass.setVertexBuffer(0, cache.vertexBuffer);
renderPass.setIndexBuffer(cache.indexBuffer, "uint16");
renderPass.drawIndexed(6);
renderPass.end();
submitCommandBuffer(encoder.finish());
`;

let layer: WebGPULayer;

const options: WebGPULayerOptions = {
  id: "webgpuLayerId",
  canvas: document.createElement("canvas"),
  powerPreference: "high-performance",
};

describe("WebGPULayer instantiation", () => {
  it("creates a WebGPU layer with proper type", async () => {
    layer = new WebGPULayer(options);
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async init
    
    expect(layer).toBeTruthy();
    expect(layer.type).toBe("webgpu");
    expect(layer.id).toBe(options.id);
  });

  it("has WebGPU device and context available", () => {
    expect(layer.device).toBeTruthy();
    expect(layer.context).toBeTruthy();
    expect(layer.adapter).toBeTruthy();
  });

  it("has WebGPU tools in API", () => {
    expect(layer.api.createBuffer).toBeTypeOf("function");
    expect(layer.api.createShaderModule).toBeTypeOf("function");
    expect(layer.api.createRenderPipeline).toBeTypeOf("function");
  });
});

describe("WebGPULayer scripts", () => {
  it("can execute setup script", async () => {
    layer.setup.code = setupScript;
    const result = await layer.execSetup();
    expect(layer.cache.pipeline).toBeTruthy();
    expect(layer.cache.vertexBuffer).toBeTruthy();
  });

  it("can execute animation script", async () => {
    layer.animation.code = animationScript;
    expect(() => layer.execAnimation()).not.toThrow();
  });
});

describe("WebGPULayer cleanup", () => {
  it("properly destroys WebGPU resources", () => {
    layer.destroy();
    expect(layer.device?.destroy).toHaveBeenCalled();
  });
});
```

### Phase 6: Dependencies and Browser Support

#### 6.1 Package Dependencies

```json
// package.json additions
{
  "devDependencies": {
    "@webgpu/types": "^0.1.38"
  }
}
```

#### 6.2 Browser Support Detection

```typescript
// src/layers/WebGPU/webgpuSupport.ts
export async function checkWebGPUSupport(): Promise<{
  supported: boolean;
  adapter?: GPUAdapter;
  features?: string[];
  limits?: Record<string, number>;
  error?: string;
}> {
  try {
    if (!navigator.gpu) {
      return {
        supported: false,
        error: "WebGPU not available in this browser",
      };
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      return {
        supported: false,
        error: "Failed to request WebGPU adapter",
      };
    }

    const features = Array.from(adapter.features);
    const limits = Object.fromEntries(
      Object.entries(adapter.limits).map(([key, value]) => [key, value])
    );

    return {
      supported: true,
      adapter,
      features,
      limits,
    };
  } catch (error) {
    return {
      supported: false,
      error: error instanceof Error ? error.message : "Unknown WebGPU error",
    };
  }
}
```

### Phase 7: Default Demos and Templates

#### 7.1 Basic Shader Demo

```typescript
// demos/default/webgpu-setup.ts
const vertexShader = createShaderModule(`
@vertex
fn vs_main(
  @location(0) position: vec2<f32>,
  @location(1) uv: vec2<f32>
) -> @builtin(position) vec4<f32> {
  return vec4<f32>(position, 0.0, 1.0);
}
`);

const fragmentShader = createShaderModule(`
@group(0) @binding(0) var<uniform> time: f32;
@group(0) @binding(1) var<uniform> resolution: vec2<f32>;

@fragment
fn fs_main(@builtin(position) fragCoord: vec4<f32>) -> @location(0) vec4<f32> {
  let uv = fragCoord.xy / resolution.xy;
  let color = 0.5 + 0.5 * cos(time + uv.xyx + vec3<f32>(0.0, 2.0, 4.0));
  return vec4<f32>(color, 1.0);
}
`);

cache.pipeline = createRenderPipeline(vertexShader, fragmentShader);
cache.vertices = createQuadVertices();
cache.indices = createQuadIndices();
cache.vertexBuffer = createBuffer(cache.vertices, GPUBufferUsage.VERTEX);
cache.indexBuffer = createBuffer(cache.indices, GPUBufferUsage.INDEX);

// Create uniform buffer for time and resolution
const uniformData = new Float32Array(4); // time, resolution.x, resolution.y, padding
cache.uniformBuffer = createBuffer(uniformData, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
```

```typescript
// demos/default/webgpu-animation.ts
// Update uniform data
const time = read('time.elapsed', 0) * 0.001;
const uniformData = new Float32Array([time, width(), height(), 0]);
device.queue.writeBuffer(cache.uniformBuffer, 0, uniformData);

// Render
const encoder = createCommandEncoder();
const renderPass = encoder.beginRenderPass();
renderPass.setPipeline(cache.pipeline);
renderPass.setVertexBuffer(0, cache.vertexBuffer);
renderPass.setIndexBuffer(cache.indexBuffer, "uint16");
renderPass.setBindGroup(0, cache.bindGroup);
renderPass.drawIndexed(6);
renderPass.end();
submitCommandBuffer(encoder.finish());
```

## Integration Considerations

### Performance Considerations

1. **Async Initialization**: WebGPU requires async adapter and device requests
2. **Buffer Management**: Efficient handling of GPU memory allocation and deallocation
3. **Command Buffer Batching**: Minimize GPU command submissions for better performance
4. **Resource Cleanup**: Proper disposal of WebGPU resources when layers are removed

### Visual Fiha Messaging Integration

1. **Input Data**: WebGPU scripts will have access to the `read()` function for MIDI, audio, and time data
2. **Real-time Updates**: Animation scripts will be called every frame by the display worker
3. **Error Handling**: Compilation and execution errors will be handled by the existing Scriptable system
4. **Async Layer Creation**: Handle async WebGPU initialization in the display worker

### User Experience

1. **Shader Editor**: Monaco Editor with WGSL syntax highlighting and autocompletion
2. **Error Reporting**: Clear WebGPU-specific error messages and debugging information
3. **Template Library**: Pre-built shader templates for common effects
4. **Performance Monitoring**: GPU performance metrics and profiling tools

### Browser Compatibility

1. **Feature Detection**: Check WebGPU availability before layer creation
2. **Graceful Degradation**: Fallback options when WebGPU is not supported
3. **Progressive Enhancement**: Optional advanced features based on GPU capabilities

## Implementation Checklist

- [ ] **Phase 1**: Core layer structure
  - [ ] Create WebGPULayer class
  - [ ] Create webgpuTools module
  - [ ] Implement async WebGPU initialization
  - [ ] Add browser support detection

- [ ] **Phase 2**: Type system integration
  - [ ] Update LayerConfig types
  - [ ] Update Display.worker.ts
  - [ ] Update display types
  - [ ] Handle async layer creation

- [ ] **Phase 3**: Editor integration
  - [ ] Create WGSL TypeScript definitions
  - [ ] Add WGSL language support to Monaco
  - [ ] Update ScriptEditor extraLibs
  - [ ] Test Monaco Editor integration

- [ ] **Phase 4**: Layer management UI
  - [ ] Add WebGPU option to layer creation
  - [ ] Create WebGPU-specific configuration panel
  - [ ] Add performance preference controls
  - [ ] Add required features selection

- [ ] **Phase 5**: Testing
  - [ ] Write unit tests with WebGPU mocks
  - [ ] Test layer creation/destruction
  - [ ] Test async initialization
  - [ ] Test script execution and error handling

- [ ] **Phase 6**: Dependencies and browser support
  - [ ] Add @webgpu/types dependency
  - [ ] Implement feature detection
  - [ ] Add graceful degradation
  - [ ] Test across different browsers

- [ ] **Phase 7**: Documentation and demos
  - [ ] Create webgpu-api.md documentation
  - [ ] Add basic shader demo scripts
  - [ ] Create template library
  - [ ] Update main documentation

## Example Usage

Once implemented, users will be able to create WebGPU layers with scripts like:

**Setup Script:**
```javascript
// Create a simple color-changing shader
const vertexShader = createShaderModule(`
  @vertex
  fn vs_main(@location(0) position: vec2<f32>) -> @builtin(position) vec4<f32> {
    return vec4<f32>(position, 0.0, 1.0);
  }
`);

const fragmentShader = createShaderModule(`
  @group(0) @binding(0) var<uniform> uniforms: vec4<f32>; // time, mouse.x, mouse.y, padding
  
  @fragment
  fn fs_main(@builtin(position) fragCoord: vec4<f32>) -> @location(0) vec4<f32> {
    let uv = fragCoord.xy / vec2<f32>(800.0, 600.0); // Use actual canvas size
    let time = uniforms.x;
    let mouse = uniforms.yz;
    
    let distance = length(uv - mouse);
    let color = 0.5 + 0.5 * cos(time + distance * 10.0 + vec3<f32>(0.0, 2.0, 4.0));
    
    return vec4<f32>(color, 1.0);
  }
`);

cache.pipeline = createRenderPipeline(vertexShader, fragmentShader);
cache.uniformBuffer = createBuffer(new Float32Array(4), GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
```

**Animation Script:**
```javascript
// Read input data for interaction
const time = read('time.elapsed', 0) * 0.001;
const midiController = read('midi.controller.1', 0.5); // MIDI controller for mouse X
const audioLevel = read('audio.level', 0); // Audio level for mouse Y

// Update uniform buffer
const uniformData = new Float32Array([time, midiController, audioLevel, 0]);
device.queue.writeBuffer(cache.uniformBuffer, 0, uniformData);

// Render the frame
const encoder = createCommandEncoder();
const renderPass = encoder.beginRenderPass();
renderPass.setPipeline(cache.pipeline);
renderPass.setBindGroup(0, cache.bindGroup);
renderPass.draw(6); // Draw two triangles (quad)
renderPass.end();
submitCommandBuffer(encoder.finish());
```

This implementation plan provides a comprehensive roadmap for adding WebGPU support to Visual Fiha while maintaining consistency with the existing architecture and patterns. The WebGPU layer will enable advanced GPU programming capabilities for creating complex visual effects and high-performance graphics programming.
