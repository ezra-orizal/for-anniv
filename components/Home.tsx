"use client";

import type { Story } from "@/components/types";

export function Home({
  story,
  onLetter,
  onYears,
  onKeep,
}: {
  story: Story;
  onLetter: () => void;
  onYears: () => void;
  onKeep: () => void;
}) {
  return (
    <section className="screen" aria-labelledby="home-title">
      <p className="mark">Placeholder</p>
      <hr className="rule" />
      <p className="kicker">For us</p>
      <h1 id="home-title">{story.herName}</h1>
      <p className="date">{story.anniversaryDate}</p>
      <nav className="home-list" aria-label="Ways in">
        <button type="button" onClick={onLetter}>
          Read it from the start
        </button>
        <button type="button" onClick={onYears}>
          The years
        </button>
        <button type="button" onClick={onKeep}>
          After seven
        </button>
      </nav>
    </section>
  );
}

export function Wander({
  story,
  onOpen,
  onBack,
}: {
  story: Story;
  onOpen: (index: number) => void;
  onBack: () => void;
}) {
  return (
    <section className="screen" aria-labelledby="wander-title">
      <p className="mark">Placeholder</p>
      <hr className="rule" />
      <p className="kicker">Together</p>
      <h1 id="wander-title">The years</h1>
      <div className="year-list">
        {story.chapters.map((chapter, index) => (
          <button key={chapter.year} type="button" onClick={() => onOpen(index)}>
            <span className="year-row">
              <img src={`/api/photos/${chapter.year}`} alt="" />
              <span className="year-copy">
                <strong>{chapter.title}</strong>
                <span>Year {chapter.year}</span>
              </span>
            </span>
          </button>
        ))}
      </div>
      <div className="screen-footer">
        <button className="text-button" type="button" onClick={onBack}>
          Back
        </button>
      </div>
    </section>
  );
}
