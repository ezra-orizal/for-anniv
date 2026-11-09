"use client";

import { useEffect, useState } from "react";
import { formatDate, type Moment, type Story } from "@/components/types";

export function Keepsake({ story, onBack, onSignedOut }: { story: Story; onBack: () => void; onSignedOut: () => void }) {
  const [moments, setMoments] = useState<Moment[] | null>(null);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [happenedOn, setHappenedOn] = useState(today);
  const [photo, setPhoto] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function load() {
    const response = await fetch("/api/moments");
    if (response.status === 401) {
      onSignedOut();
      return;
    }
    if (!response.ok) {
      setError("The wall could not be opened.");
      setMoments([]);
      return;
    }
    const data = (await response.json()) as { moments: Moment[] };
    setMoments(data.moments);
  }

  useEffect(() => {
    let cancel = false;
    fetch("/api/moments").then(async (response) => {
      if (cancel) return;
      if (response.status === 401) {
        onSignedOut();
        return;
      }
      if (!response.ok) {
        setError("The wall could not be opened.");
        setMoments([]);
        return;
      }
      const data = (await response.json()) as { moments: Moment[] };
      setMoments(data.moments);
    });
    return () => {
      cancel = true;
    };
  }, [onSignedOut]);

  async function onFile(file: File | undefined) {
    setError("");
    if (!file) {
      setPhoto(null);
      return;
    }
    try {
      setPhoto(await resizePhoto(file));
    } catch {
      setPhoto(null);
      setError("That photo could not be prepared. Try another one.");
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!photo) {
      setError("Add a photo from that day.");
      return;
    }
    setPending(true);
    const response = await fetch("/api/moments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ happenedOn, title, body, photo }),
    });
    setPending(false);
    if (response.status === 401) {
      onSignedOut();
      return;
    }
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "The moment could not be kept.");
      return;
    }
    setTitle("");
    setBody("");
    setPhoto(null);
    setHappenedOn(today());
    await load();
  }

  return (
    <section className="screen" aria-labelledby="keep-title">
      <p className="mark">Placeholder</p>
      <hr className="rule" />
      <p className="kicker">Keepsake</p>
      <h1 id="keep-title">After seven</h1>
      <p className="intro">The seven years stay as they were written. This is for the days after.</p>
      {moments && moments.length === 0 ? <p className="empty">Nothing here yet.</p> : null}
      <div className="moments">
        {moments?.map((moment) => (
          <article className="moment" key={moment.id}>
            {moment.photo ? <img className="photo" src={moment.photo} alt="" /> : null}
            <time dateTime={moment.happenedOn}>{formatDate(moment.happenedOn)}</time>
            <h2>{moment.title}</h2>
            <p>{moment.body}</p>
          </article>
        ))}
      </div>
      <form className="stack" onSubmit={submit}>
        <h2>Add a moment</h2>
        <div className="prompts">
          {story.prompts.map((prompt) => (
            <button
              key={prompt}
              className="chip"
              type="button"
              aria-pressed={title === prompt}
              onClick={() => setTitle(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="when">Date</label>
          <input id="when" type="date" value={happenedOn} onChange={(event) => setHappenedOn(event.target.value)} required />
        </div>
        <div>
          <label htmlFor="title">Title</label>
          <input id="title" type="text" maxLength={80} value={title} onChange={(event) => setTitle(event.target.value)} required />
        </div>
        <div>
          <label htmlFor="body">The moment</label>
          <textarea id="body" maxLength={2000} value={body} onChange={(event) => setBody(event.target.value)} required />
        </div>
        <div>
          <p className="kicker" id="photo-label">
            Photo
          </p>
          <label className="file">
            <input
              id="photo"
              aria-labelledby="photo-label"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              onChange={(event) => onFile(event.target.files?.[0])}
            />
            {photo ? "Photo ready" : "Add a photo"}
          </label>
          {photo ? <img className="preview" src={photo} alt="" /> : null}
        </div>
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
        <button className="quiet" type="submit" disabled={pending}>
          {pending ? "Keeping" : "Keep this"}
        </button>
      </form>
      <div className="screen-footer">
        <button className="text-button" type="button" onClick={onBack}>
          Back
        </button>
      </div>
    </section>
  );
}

function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

async function resizePhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxEdge = 1600;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  let quality = 0.82;
  let url = canvas.toDataURL("image/jpeg", quality);
  while (url.length > 680_000 && quality > 0.5) {
    quality -= 0.08;
    url = canvas.toDataURL("image/jpeg", quality);
  }
  if (url.length > 700_000) throw new Error("too big");
  return url;
}
