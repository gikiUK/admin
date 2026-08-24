import { MAX_IMAGE_BYTES, validateImageFile } from "@/components/signup-links/image/use-image-upload";

function makeFile(type: string, size: number): File {
  const file = new File(["x"], "image", { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("validateImageFile", () => {
  test.each(["image/jpeg", "image/png", "image/gif", "image/webp"])("accepts %s", (type) => {
    expect(validateImageFile(makeFile(type, 1024))).toBeNull();
  });

  test("rejects unsupported types", () => {
    expect(validateImageFile(makeFile("application/pdf", 1024))).toMatch(/JPEG/);
  });

  test("rejects files over 5 MB", () => {
    expect(validateImageFile(makeFile("image/png", MAX_IMAGE_BYTES + 1))).toMatch(/5 MB/);
  });

  test("accepts a file exactly at the limit", () => {
    expect(validateImageFile(makeFile("image/png", MAX_IMAGE_BYTES))).toBeNull();
  });
});
