const MAX_PHOTO_BYTES = 500_000;

export type StoredPhoto = {
  buffer: Buffer;
  type: "image/jpeg" | "image/png";
};

export function parsePhoto(input: unknown): StoredPhoto | { error: string } | null {
  if (input == null || input === "") return null;
  if (typeof input !== "string") return { error: "Add a jpeg or png." };
  const match = /^data:image\/(jpeg|png);base64,([A-Za-z0-9+/=\s]+)$/.exec(input);
  if (!match) return { error: "Add a jpeg or png." };
  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (buffer.length === 0 || buffer.length > MAX_PHOTO_BYTES) {
    return { error: "That photo is too big." };
  }
  if (match[1] === "jpeg" && !isJpeg(buffer)) return { error: "Add a jpeg or png." };
  if (match[1] === "png" && !isPng(buffer)) return { error: "Add a jpeg or png." };
  return { buffer, type: match[1] === "jpeg" ? "image/jpeg" : "image/png" };
}

export function photoDataUrl(buffer: Buffer, type: string): string | null {
  if (type !== "image/jpeg" && type !== "image/png") return null;
  return `data:${type};base64,${buffer.toString("base64")}`;
}

function isJpeg(buffer: Buffer): boolean {
  return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

function isPng(buffer: Buffer): boolean {
  return (
    buffer.length > 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  );
}
