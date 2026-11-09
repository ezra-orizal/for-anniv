import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "anniv_session";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const SAMPLE_WORD = "placeholder";

const failures = new Map<string, { count: number; reset: number }>();

export function configuredPassphrase(): string | null {
  const fromEnv = process.env.PASSPHRASE?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") return SAMPLE_WORD;
  return null;
}

export function previewWord(): string | null {
  if (process.env.PASSPHRASE?.trim()) return null;
  if (process.env.NODE_ENV === "production") return null;
  return SAMPLE_WORD;
}

export function passphraseMatches(input: string): boolean {
  const secret = configuredPassphrase();
  const word = input.trim();
  if (!secret || !word || word.length > 80) return false;
  const a = createHash("sha256").update(word).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

function sign(payload: string): string | null {
  const secret = configuredPassphrase();
  if (!secret) return null;
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(): string | null {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `v1.${exp}`;
  const signature = sign(payload);
  if (!signature) return null;
  return `${payload}.${signature}`;
}

export function tokenIsValid(token: string | undefined | null): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = sign(payload);
  if (!expected) return false;
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length) return false;
  if (!timingSafeEqual(actualBytes, expectedBytes)) return false;
  const [version, expText] = payload.split(".");
  if (version !== "v1") return false;
  const exp = Number(expText);
  return Number.isFinite(exp) && exp > Date.now();
}

export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  return tokenIsValid(jar.get(COOKIE_NAME)?.value);
}

export function cookieMaxAge(): number {
  return MAX_AGE_SECONDS;
}

export function requestIsSecure(request: Request): boolean {
  if (new URL(request.url).protocol === "https:") return true;
  const forwarded = request.headers.get("x-forwarded-proto");
  return forwarded?.split(",").some((part) => part.trim() === "https") ?? false;
}

export function tooManyFailures(key: string): boolean {
  const now = Date.now();
  const row = failures.get(key);
  if (!row || row.reset < now) return false;
  return row.count >= 8;
}

export function noteFailure(key: string): void {
  const now = Date.now();
  const row = failures.get(key);
  if (!row || row.reset < now) {
    failures.set(key, { count: 1, reset: now + 10 * 60 * 1000 });
    return;
  }
  row.count += 1;
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "local";
}
