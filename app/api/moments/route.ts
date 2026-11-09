import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { readMomentInput } from "@/lib/moment-input";
import { addMoment, listMoments } from "@/lib/moments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 800_000;

function unauthorized() {
  return NextResponse.json({ error: "Open the door first." }, { status: 401 });
}

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  try {
    const moments = await listMoments();
    return NextResponse.json({ moments }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "The wall could not be opened." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthed())) return unauthorized();
  const raw = await request.text();
  if (raw.length > MAX_BODY) {
    return NextResponse.json({ error: "That photo is too big." }, { status: 413 });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "The moment could not be read." }, { status: 400 });
  }
  const input = readMomentInput(parsed);
  if ("error" in input) {
    return NextResponse.json({ error: input.error }, { status: 400 });
  }
  try {
    await addMoment(input);
  } catch {
    return NextResponse.json({ error: "The moment could not be kept." }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
