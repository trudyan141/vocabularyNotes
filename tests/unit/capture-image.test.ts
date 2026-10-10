import { describe, expect, it } from "vitest";
import {
  fullTransform,
  imageHeader,
  validateTransform,
} from "../../src/lib/capture/image";
function png(width: number, height: number) {
  const data = new Uint8Array(24);
  data.set([137, 80, 78, 71, 13, 10, 26, 10]);
  data.set([73, 72, 68, 82], 12);
  const view = new DataView(data.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return data;
}
describe("image intake safety", () => {
  it("rejects oversized dimensions before any decode and never trusts file extensions", () => {
    expect(imageHeader(png(4000, 3000))).toEqual({
      mime: "image/png",
      width: 4000,
      height: 3000,
    });
    expect(() => imageHeader(png(6000, 4000))).toThrow("pixels");
    expect(() => imageHeader(png(0, 1))).toThrow("pixels");
    expect(() =>
      imageHeader(new TextEncoder().encode('<svg onload="fetch()">')),
    ).toThrow("format");
  });
  it("recognizes HEIC and broken JPEG instead of accepting empty dimensions", () => {
    const heic = new Uint8Array(16);
    heic.set(new TextEncoder().encode("ftypheic"), 4);
    expect(() => imageHeader(heic)).toThrow("heic");
    expect(() =>
      imageHeader(new Uint8Array([255, 216, 255, 192, 255, 255])),
    ).toThrow("decode");
  });
  it("reads JPEG and WebP dimensions with bounded parsing", () => {
    const jpeg = new Uint8Array([255, 216, 255, 192, 0, 8, 8, 1, 44, 2, 88, 3]);
    expect(imageHeader(jpeg)).toEqual({
      mime: "image/jpeg",
      width: 600,
      height: 300,
    });
    const webp = new Uint8Array(30);
    webp.set(new TextEncoder().encode("RIFF"));
    webp.set(new TextEncoder().encode("WEBPVP8X"), 8);
    webp[24] = 199;
    webp[27] = 99;
    expect(imageHeader(webp)).toEqual({
      mime: "image/webp",
      width: 200,
      height: 100,
    });
    webp[20] = 2;
    expect(() => imageHeader(webp)).toThrow("format");
  });
  it("bounds crop and prevents empty, nonfinite or invalid rotations", () => {
    expect(validateTransform(fullTransform)).toBe(fullTransform);
    for (const crop of [
      { left: 10, top: 0, right: 10, bottom: 100 },
      { left: -1, top: 0, right: 100, bottom: 100 },
      { left: 0, top: NaN, right: 100, bottom: 100 },
      { left: 0, top: 0, right: 101, bottom: 100 },
    ])
      expect(() => validateTransform({ rotation: 0, crop })).toThrow("crop");
    expect(() =>
      validateTransform({ ...fullTransform, rotation: 45 as 0 }),
    ).toThrow("crop");
  });
});
