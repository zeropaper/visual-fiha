import type * as assetTools from '../src/utils/assetTools'

declare global {
  const clearFetchedAssets: typeof assetTools.clearFetchedAssets
  const loadImage: typeof assetTools.loadImage
  const loadVideo: typeof assetTools.loadVideo
  const asset: typeof assetTools.asset
}

export { }
