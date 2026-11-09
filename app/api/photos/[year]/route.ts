import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ year: string }> }) {
  if (!(await isAuthed())) {
    return new NextResponse(null, { status: 401 });
  }
  const { year } = await context.params;
  if (!/^[1-7]$/.test(year)) {
    return new NextResponse(null, { status: 404 });
  }
  const filePath = path.join(process.cwd(), "photos", `year-${year}.jpg`);
  try {
    const bytes = await readFile(filePath);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
