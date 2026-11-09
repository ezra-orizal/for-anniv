import { NextResponse } from "next/server";
import { getStory } from "@/content/story";
import {
  COOKIE_NAME,
  clientKey,
  cookieMaxAge,
  createSessionToken,
  noteFailure,
  passphraseMatches,
  previewWord,
  requestIsSecure,
  tooManyFailures,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const story = getStory();
  return NextResponse.json(
    {
      previewWord: previewWord(),
      herName: story.herName,
      anniversaryDate: story.anniversaryDate,
      doorLine: story.doorLine,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const key = clientKey(request);
  if (tooManyFailures(key)) {
    return NextResponse.json({ error: "Wait a little, then try the word again." }, { status: 429 });
  }

  const raw = await request.text();
  if (raw.length > 200) {
    noteFailure(key);
    return NextResponse.json({ error: "That word isn't the one." }, { status: 401 });
  }

  let passphrase = "";
  try {
    const body = JSON.parse(raw) as { passphrase?: unknown };
    if (typeof body.passphrase === "string") passphrase = body.passphrase;
  } catch {
    passphrase = "";
  }

  if (!passphraseMatches(passphrase)) {
    noteFailure(key);
    return NextResponse.json({ error: "That word isn't the one." }, { status: 401 });
  }

  const token = createSessionToken();
  if (!token) {
    return NextResponse.json({ error: "The door is not ready yet." }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: requestIsSecure(request),
    path: "/",
    maxAge: cookieMaxAge(),
  });
  return response;
}
