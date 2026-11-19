import { describe, expect, test } from "bun:test";
import { validatePhotos, type Photo } from "../../lib/photos";

const photo: Photo = { src: "/images/travel/example.jpg", alt: "An explicitly described photograph", width: 2400, height: 1600 };
describe("gallery authoring contract", () => {
  test("accepts local photographs with descriptive alt text and actual dimensions", () => expect(() => validatePhotos([photo])).not.toThrow());
  test("rejects remote images, missing descriptions and invalid dimensions", () => {
    for (const override of [{ src: "https://example.com/photo.jpg" }, { src: "/images/../resume.pdf" }, { alt: " " }, { width: 0 }, { height: 1.5 }]) expect(() => validatePhotos([{ ...photo, ...override }])).toThrow();
    expect(() => validatePhotos([])).toThrow();
  });
});
