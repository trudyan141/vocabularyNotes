export const imageLimits = {
  bytes: 10_000_000,
  pixels: 20_000_000,
  edge: 2200,
};
export type Crop = { left: number; top: number; right: number; bottom: number };
export type Transform = { rotation: 0 | 90 | 180 | 270; crop: Crop };
export const fullTransform: Transform = {
  rotation: 0,
  crop: { left: 0, top: 0, right: 100, bottom: 100 },
};
export class ImageError extends Error {
  constructor(
    public code: "format" | "heic" | "size" | "pixels" | "decode" | "crop",
  ) {
    super(code);
  }
}
export function validateDimensions(width: number, height: number) {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width * height > imageLimits.pixels
  )
    throw new ImageError("pixels");
}
// Inspect dimensions before decoding. Never accept SVG, remote URLs or a MIME claim alone.
export function imageHeader(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (start: number, length: number) =>
    String.fromCharCode(...bytes.subarray(start, start + length));
  let mime: string,
    width = 0,
    height = 0;
  if (bytes.length >= 12 && ascii(4, 4) === "ftyp")
    throw new ImageError("heic");
  if (
    bytes.length >= 24 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n) &&
    ascii(12, 4) === "IHDR"
  ) {
    mime = "image/png";
    width = view.getUint32(16);
    height = view.getUint32(20);
  } else if (bytes[0] === 255 && bytes[1] === 216) {
    mime = "image/jpeg";
    let offset = 2;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset++] !== 255) throw new ImageError("decode");
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (marker === 218 || marker === 217) break;
      if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
      if (offset + 2 > bytes.length) break;
      const length = view.getUint16(offset);
      if (length < 2 || offset + length > bytes.length)
        throw new ImageError("decode");
      if (
        [
          192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207,
        ].includes(marker)
      ) {
        if (length < 8) throw new ImageError("decode");
        height = view.getUint16(offset + 3);
        width = view.getUint16(offset + 5);
        break;
      }
      offset += length;
    }
  } else if (
    bytes.length >= 30 &&
    ascii(0, 4) === "RIFF" &&
    ascii(8, 4) === "WEBP"
  ) {
    mime = "image/webp";
    const chunk = ascii(12, 4);
    if (chunk === "VP8X") {
      if (bytes[20] & 2) throw new ImageError("format"); // animated image
      width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
      height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
    } else if (
      chunk === "VP8 " &&
      bytes[23] === 157 &&
      bytes[24] === 1 &&
      bytes[25] === 42
    ) {
      width = view.getUint16(26, true) & 16383;
      height = view.getUint16(28, true) & 16383;
    } else if (chunk === "VP8L" && bytes[20] === 47) {
      width = 1 + bytes[21] + ((bytes[22] & 63) << 8);
      height =
        1 + (bytes[22] >> 6) + (bytes[23] << 2) + ((bytes[24] & 15) << 10);
    }
  } else throw new ImageError("format");
  validateDimensions(width, height);
  return { mime, width, height };
}
export function validateTransform(value: Transform): Transform {
  const { crop: c, rotation } = value;
  if (
    ![0, 90, 180, 270].includes(rotation) ||
    !Object.values(c).every(Number.isFinite) ||
    c.left < 0 ||
    c.top < 0 ||
    c.right > 100 ||
    c.bottom > 100 ||
    c.right - c.left < 1 ||
    c.bottom - c.top < 1
  )
    throw new ImageError("crop");
  return value;
}
function canvas(width: number, height: number) {
  const node = document.createElement("canvas");
  node.width = width;
  node.height = height;
  const ctx = node.getContext("2d");
  if (!ctx) throw new ImageError("decode");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);
  return { node, ctx };
}
export async function jpeg(node: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) =>
    node.toBlob(resolve, "image/jpeg", 0.9),
  );
  if (!blob || blob.size > imageLimits.bytes) throw new ImageError("size");
  return { blob, width: node.width, height: node.height };
}
export type PreparedImage = Awaited<ReturnType<typeof jpeg>>;
export async function normalizeImage(blob: Blob): Promise<PreparedImage> {
  if (!blob.size || blob.size > imageLimits.bytes) throw new ImageError("size");
  const header = imageHeader(new Uint8Array(await blob.arrayBuffer()));
  if (
    blob.type &&
    blob.type !== header.mime &&
    blob.type !== "application/octet-stream"
  )
    throw new ImageError("format");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
  } catch {
    throw new ImageError("decode");
  }
  try {
    validateDimensions(bitmap.width, bitmap.height);
    const ratio = Math.min(
      1,
      imageLimits.edge / Math.max(bitmap.width, bitmap.height),
    );
    const { node, ctx } = canvas(
      Math.max(1, Math.round(bitmap.width * ratio)),
      Math.max(1, Math.round(bitmap.height * ratio)),
    );
    ctx.drawImage(bitmap, 0, 0, node.width, node.height);
    // Re-encoding strips EXIF/GPS and bakes the orientation into the pixels.
    return await jpeg(node);
  } finally {
    bitmap.close();
  }
}
export async function transformImage(
  source: Blob,
  transform: Transform,
): Promise<PreparedImage> {
  validateTransform(transform);
  const bitmap = await createImageBitmap(source);
  try {
    const swap = transform.rotation === 90 || transform.rotation === 270;
    const width = swap ? bitmap.height : bitmap.width,
      height = swap ? bitmap.width : bitmap.height;
    const rotated = canvas(width, height);
    rotated.ctx.translate(width / 2, height / 2);
    rotated.ctx.rotate((transform.rotation * Math.PI) / 180);
    rotated.ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
    const c = transform.crop;
    const x = Math.round((c.left * width) / 100),
      y = Math.round((c.top * height) / 100);
    const w = Math.max(1, Math.round((c.right * width) / 100) - x),
      h = Math.max(1, Math.round((c.bottom * height) / 100) - y);
    const output = canvas(w, h);
    output.ctx.drawImage(rotated.node, x, y, w, h, 0, 0, w, h);
    return await jpeg(output.node);
  } finally {
    bitmap.close();
  }
}
