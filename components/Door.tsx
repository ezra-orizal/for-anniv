"use client";

import { useEffect, useState } from "react";
import type { Story } from "@/components/types";

export function Door({
  herName,
  anniversaryDate,
  doorLine,
  previewWord,
  onOpen,
}: {
  herName: string;
  anniversaryDate: string;
  doorLine: string;
  previewWord: string | null;
  onOpen: () => void;
}) {
  const [word, setWord] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/enter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passphrase: word }),
    });
    setPending(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "That word isn't the one.");
      return;
    }
    onOpen();
  }

  return (
    <section className="screen" aria-labelledby="door-title">
      <p className="mark">Placeholder</p>
      <hr className="rule" />
      <p className="kicker">Seven</p>
      <h1 id="door-title">{herName}</h1>
      <p className="date">{anniversaryDate}</p>
      <p className="door-line">{doorLine}</p>
      <form className="stack door-form" data-hydrated={ready ? "true" : "false"} onSubmit={submit}>
        <div>
          <label htmlFor="word">The word</label>
          <input
            id="word"
            name="word"
            type="text"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            value={word}
            onChange={(event) => setWord(event.target.value)}
          />
        </div>
        {previewWord ? (
          <p className="note">Preview only. The word is {previewWord}.</p>
        ) : null}
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="screen-footer">
          <button className="quiet" type="submit" disabled={pending}>
            {pending ? "Opening" : "Open"}
          </button>
        </div>
      </form>
    </section>
  );
}

export function Choice({ story, onBegin, onTogether }: { story: Story; onBegin: () => void; onTogether: () => void }) {
  return (
    <section className="screen" aria-labelledby="choice-title">
      <p className="mark">Placeholder</p>
      <hr className="rule" />
      <p className="kicker">Seven</p>
      <h1 id="choice-title">{story.herName}</h1>
      <p className="date">{story.anniversaryDate}</p>
      <div className="choice-list">
        <button type="button" onClick={onBegin}>
          Begin
        </button>
        <button type="button" onClick={onTogether}>
          We&apos;re reading this together
        </button>
      </div>
    </section>
  );
}
