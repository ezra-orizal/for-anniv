import { parsePhoto, type StoredPhoto } from "@/lib/photo";

export type MomentInput = {
  happenedOn: string;
  title: string;
  body: string;
  photo: StoredPhoto;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function readMomentInput(value: unknown): MomentInput | { error: string } {
  if (!value || typeof value !== "object") return { error: "The moment needs a date, a title, and a few sentences." };
  const row = value as Record<string, unknown>;
  const happenedOn = typeof row.happenedOn === "string" ? row.happenedOn.trim() : "";
  const title = typeof row.title === "string" ? row.title.trim() : "";
  const body = typeof row.body === "string" ? row.body.trim() : "";
  if (!DATE.test(happenedOn) || Number.isNaN(Date.parse(`${happenedOn}T00:00:00Z`))) {
    return { error: "Choose a real date." };
  }
  if (!title || title.length > 80) return { error: "Give it a short title." };
  if (!body || body.length > 2000) return { error: "Keep the moment to a few sentences." };
  const photo = parsePhoto(row.photo);
  if (!photo) return { error: "Add a photo from that day." };
  if ("error" in photo) return photo;
  return { happenedOn, title, body, photo };
}
