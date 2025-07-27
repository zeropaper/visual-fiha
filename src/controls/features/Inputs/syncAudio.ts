export async function loadTrack(
  source: string | File | Blob,
  ctx: AudioContext,
) {
  let arrayBuffer: ArrayBuffer;

  if (typeof source === "string") {
    arrayBuffer = await (await fetch(source)).arrayBuffer();
  } else if (source instanceof File || source instanceof Blob) {
    arrayBuffer = await source.arrayBuffer();
  } else {
    throw new Error("Invalid source: must be string, File, or Blob.");
  }

  const buffer = await ctx.decodeAudioData(arrayBuffer);
  const node = ctx.createBufferSource();
  node.buffer = buffer;
  node.connect(ctx.destination);
  return node;
}
