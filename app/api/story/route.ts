import { NextResponse } from "next/server";
import { getStory } from "@/content/story";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Open the door first." }, { status: 401 });
  }
  return NextResponse.json(getStory(), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
