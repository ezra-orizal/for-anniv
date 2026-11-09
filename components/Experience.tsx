"use client";

import { useCallback, useEffect, useState } from "react";
import { Choice, Door } from "@/components/Door";
import { Home, Wander } from "@/components/Home";
import { Keepsake } from "@/components/Keepsake";
import { ChapterScreen, Closing, Letter } from "@/components/StoryScreens";
import { hasOpened, markOpened, rememberStep, savedStep, type Step, type Story } from "@/components/types";

export function Experience() {
  const [story, setStory] = useState<Story | null>(null);
  const [step, setStep] = useState<Step>({ name: "loading" });
  const [previewWord, setPreviewWord] = useState<string | null>(null);
  const [doorCopy, setDoorCopy] = useState({
    herName: "Her name",
    anniversaryDate: "The anniversary date",
    doorLine: "Open this when you are alone.",
  });
  const [error, setError] = useState("");

  const go = useCallback((next: Step) => {
    rememberStep(next);
    setStep(next);
  }, []);

  const signedOut = useCallback(() => {
    setStory(null);
    setStep({ name: "door" });
  }, []);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const response = await fetch("/api/story");
      if (cancel) return;
      if (response.status === 401) {
        const preview = await fetch("/api/enter");
        const data = preview.ok
          ? ((await preview.json()) as {
              previewWord?: string | null;
              herName?: string;
              anniversaryDate?: string;
              doorLine?: string;
            })
          : {};
        if (cancel) return;
        setPreviewWord(data.previewWord ?? null);
        setDoorCopy({
          herName: data.herName || "Her name",
          anniversaryDate: data.anniversaryDate || "The anniversary date",
          doorLine: data.doorLine || "Open this when you are alone.",
        });
        setStep({ name: "door" });
        return;
      }
      if (!response.ok) {
        setError("The letter could not be opened.");
        setStep({ name: "door" });
        return;
      }
      const nextStory = (await response.json()) as Story;
      if (cancel) return;
      setStory(nextStory);
      setStep(savedStep() ?? (hasOpened() ? { name: "home" } : { name: "choice" }));
    })();
    return () => {
      cancel = true;
    };
  }, []);

  async function afterDoor() {
    const response = await fetch("/api/story");
    if (!response.ok) {
      setError("The letter could not be opened.");
      return;
    }
    const nextStory = (await response.json()) as Story;
    setStory(nextStory);
    setError("");
    go(savedStep() ?? (hasOpened() ? { name: "home" } : { name: "choice" }));
  }

  if (step.name === "loading") {
    return (
      <section className="screen" aria-label="Opening">
        <p className="mark">Placeholder</p>
        <hr className="rule" />
      </section>
    );
  }

  if (step.name === "door" || !story) {
    return (
      <>
        <Door {...doorCopy} previewWord={previewWord} onOpen={afterDoor} />
        {error ? <p className="error">{error}</p> : null}
      </>
    );
  }

  if (step.name === "choice") {
    return (
      <Choice
        story={story}
        onBegin={() => go({ name: "letter", surprise: true })}
        onTogether={() => go({ name: "home" })}
      />
    );
  }

  if (step.name === "letter") {
    return <Letter story={story} onNext={() => go({ name: "chapter", index: 0, surprise: step.surprise })} />;
  }

  if (step.name === "chapter") {
    const chapter = story.chapters[step.index];
    if (!chapter) return null;
    const last = step.index >= story.chapters.length - 1;
    return (
      <ChapterScreen
        chapter={chapter}
        surprise={step.surprise}
        onNext={() => {
          if (step.surprise) {
            go(last ? { name: "closing", surprise: true } : { name: "chapter", index: step.index + 1, surprise: true });
            return;
          }
          if (!last) go({ name: "chapter", index: step.index + 1, surprise: false });
        }}
        onPrev={!step.surprise && step.index > 0 ? () => go({ name: "chapter", index: step.index - 1, surprise: false }) : undefined}
        onClose={step.surprise ? undefined : () => go({ name: "wander" })}
      />
    );
  }

  if (step.name === "closing") {
    return (
      <Closing
        story={story}
        onEnter={() => {
          markOpened();
          go({ name: "home" });
        }}
      />
    );
  }

  if (step.name === "wander") {
    return (
      <Wander
        story={story}
        onOpen={(index) => go({ name: "chapter", index, surprise: false })}
        onBack={() => go({ name: "home" })}
      />
    );
  }

  if (step.name === "keep") {
    return <Keepsake story={story} onBack={() => go({ name: "home" })} onSignedOut={signedOut} />;
  }

  return (
    <Home
      story={story}
      onLetter={() => go({ name: "letter", surprise: true })}
      onYears={() => go({ name: "wander" })}
      onKeep={() => go({ name: "keep" })}
    />
  );
}
