import ThreeJSLayer, { type ThreeJSLayerOptions } from './ThreeJSLayer'

const setupScript = 'console.info("hello"); return { newData: "set" };'

let layer: ThreeJSLayer

const options = {
  id: 'layerId',
  canvas: document.createElement('canvas')
} as ThreeJSLayerOptions

const compilationErrorListener = jest.fn((err) => {
  console.info(err.builderStr)
})

describe.skip('instanciation', () => {
  it('takes some options', () => {
    layer = new ThreeJSLayer(options)
    expect(layer).toBeTruthy()
    expect(layer).toHaveProperty('setup.isAsync', false)
    expect(layer).toHaveProperty('setup.version', 2)
    expect(layer).toHaveProperty('id', options.id)
  })

  it('throws an error if no id is provided', () => {
    expect(() => new ThreeJSLayer({
      canvas: document.createElement('canvas')
    } as ThreeJSLayerOptions)).toThrowError()
  })

  it('has a cache', () => {
    expect(layer).toHaveProperty('cache', {})
  })
})

describe.skip('setup script', () => {
  it('is empty by default', () => {
    expect(layer).toHaveProperty('setup.code', '')
  })

  it('has a version number', () => {
    expect(layer).toHaveProperty('setup.version', 2)
  })

  it('can be set', () => {
    layer.setup.addEventListener('compilationerror', compilationErrorListener)
    expect(() => {
      layer.setup.code = setupScript
    }).not.toThrowError()
    expect(compilationErrorListener).not.toHaveBeenCalled()
    expect(layer).toHaveProperty('setup.version', 3)
    expect(layer).toHaveProperty('setup.code', setupScript)
  })

  it('always executes asynchronimously', async () => {
    layer.setup.code = 'return await (new Promise((res) => res({ newData: "set" })))'
    expect(layer).toHaveProperty('setup.isAsync', true)
    const promise = layer.execSetup()
    await expect(promise).resolves.toStrictEqual({ newData: 'set' })
  })

  it('can be used to set the scripts cache', () => {
    expect(layer).toHaveProperty('cache', { newData: 'set' })
  })
})

describe.skip('animation script', () => {
  it('is empty by default', () => {
    expect(layer).toHaveProperty('animation.code', '')
  })

  it('can use the script cache', () => {
    const logListener = jest.fn()
    const code = 'cache.added = true; scriptLog("cache", cache);'
    layer.animation.code = code
    layer.animation.addEventListener('log', logListener)
    layer.animation.addEventListener('executionerror', (err) => { console.info(err) })
    expect(layer).toHaveProperty('animation.code', code)
    expect(layer.cache).toHaveProperty('newData', 'set')
    expect(layer.execAnimation).not.toThrow()
    expect(layer.cache).toHaveProperty('newData', 'set')
    expect(layer.cache).toHaveProperty('added', true)
    expect(logListener).toHaveBeenCalledWith({
      data: [
        ['cache', { newData: 'set', added: true }]
      ],
      type: 'log'
    })
    layer.animation.removeEventListener('log', logListener)
  })
})
