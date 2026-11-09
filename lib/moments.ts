import { randomUUID } from "crypto";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import { Pool } from "pg";
import { photoDataUrl, type StoredPhoto } from "@/lib/photo";

export type Moment = {
  id: string;
  happenedOn: string;
  title: string;
  body: string;
  photo: string | null;
  createdAt: string;
};

type FileMoment = {
  id: string;
  happenedOn: string;
  title: string;
  body: string;
  photo: string | null;
  photoType: string | null;
  createdAt: string;
};

const filePath = path.join(process.cwd(), "data", "moments.json");
let pool: Pool | null = null;
let writeChain: Promise<unknown> = Promise.resolve();
let tableReady: Promise<void> | null = null;

function databaseUrl(): string | null {
  const url = process.env.DATABASE_URL?.trim();
  return url || null;
}

function getPool(): Pool | null {
  const url = databaseUrl();
  if (!url) return null;
  if (!pool) {
    pool = new Pool({ connectionString: url, max: 3 });
  }
  return pool;
}

function logDbError(error: unknown) {
  const message = error instanceof Error ? error.message : "unknown";
  if (/postgres:\/\//i.test(message) || /password/i.test(message)) {
    console.error("moments query failed");
    return;
  }
  console.error("moments query failed:", message);
}

async function ensureTable(db: Pool): Promise<void> {
  if (!tableReady) {
    tableReady = db
      .query(`
        CREATE TABLE IF NOT EXISTS moments (
          id uuid PRIMARY KEY,
          happened_on date NOT NULL,
          title text NOT NULL,
          body text NOT NULL,
          photo bytea,
          photo_type text,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `)
      .then(() => undefined)
      .catch((error) => {
        tableReady = null;
        throw error;
      });
  }
  await tableReady;
}

function enqueue<T>(work: () => Promise<T>): Promise<T> {
  const run = writeChain.then(work, work);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readFileMoments(): Promise<FileMoment[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isFileMoment);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    throw error;
  }
}

function isFileMoment(value: unknown): value is FileMoment {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<FileMoment>;
  return (
    typeof row.id === "string" &&
    typeof row.happenedOn === "string" &&
    typeof row.title === "string" &&
    typeof row.body === "string" &&
    typeof row.createdAt === "string"
  );
}

function toMoment(row: FileMoment): Moment {
  const photo =
    row.photo && row.photoType ? photoDataUrl(Buffer.from(row.photo, "base64"), row.photoType) : null;
  return {
    id: row.id,
    happenedOn: row.happenedOn,
    title: row.title,
    body: row.body,
    photo,
    createdAt: row.createdAt,
  };
}

export async function listMoments(): Promise<Moment[]> {
  const db = getPool();
  if (!db) {
    const rows = await readFileMoments();
    return rows
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 100)
      .map(toMoment);
  }
  try {
    await ensureTable(db);
    const result = await db.query<{
      id: string;
      happened_on: string;
      title: string;
      body: string;
      photo: Buffer | null;
      photo_type: string | null;
      created_at: Date;
    }>(`
      SELECT id,
             to_char(happened_on, 'YYYY-MM-DD') AS happened_on,
             title,
             body,
             photo,
             photo_type,
             created_at
      FROM moments
      ORDER BY created_at DESC
      LIMIT 100
    `);
    return result.rows.map((row) => ({
      id: row.id,
      happenedOn: row.happened_on,
      title: row.title,
      body: row.body,
      photo: row.photo && row.photo_type ? photoDataUrl(row.photo, row.photo_type) : null,
      createdAt: row.created_at.toISOString(),
    }));
  } catch (error) {
    logDbError(error);
    throw error;
  }
}

export async function addMoment(input: {
  happenedOn: string;
  title: string;
  body: string;
  photo: StoredPhoto;
}): Promise<void> {
  const db = getPool();
  if (!db) {
    await enqueue(async () => {
      const rows = await readFileMoments();
      rows.push({
        id: randomUUID(),
        happenedOn: input.happenedOn,
        title: input.title,
        body: input.body,
        photo: input.photo.buffer.toString("base64"),
        photoType: input.photo.type,
        createdAt: new Date().toISOString(),
      });
      await mkdir(path.dirname(filePath), { recursive: true });
      const temporary = `${filePath}.${process.pid}.tmp`;
      await writeFile(temporary, JSON.stringify(rows), "utf8");
      await rename(temporary, filePath);
    });
    return;
  }
  try {
    await ensureTable(db);
    await db.query(
      `INSERT INTO moments (id, happened_on, title, body, photo, photo_type)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [randomUUID(), input.happenedOn, input.title, input.body, input.photo.buffer, input.photo.type],
    );
  } catch (error) {
    logDbError(error);
    throw error;
  }
}
