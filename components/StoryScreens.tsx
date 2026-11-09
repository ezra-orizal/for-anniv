"use client";

import type { Chapter, Story } from "@/components/types";
import { yearWord } from "@/components/types";

export function Letter({ story, onNext }: { story: Story; onNext: () => void }) {
  return (
    <section className="screen" aria-labelledby="letter-title">
      <p className="mark">Placeholder</p>
      <hr className="rule" />
      <p className="kicker">A letter</p>
      <h1 id="letter-title">{story.herName}</h1>
      <div className="letter">
        {story.letter.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <p className="signature">— {story.letter.signature}</p>
      </div>
      <div className="screen-footer">
        <button className="quiet" type="button" onClick={onNext}>
          Keep going
        </button>
      </div>
    </section>
  );
}

export function ChapterScreen({
  chapter,
  surprise,
  onNext,
  onPrev,
  onClose,
}: {
  chapter: Chapter;
  surprise: boolean;
  onNext: () => void;
  onPrev?: () => void;
  onClose?: () => void;
}) {
  const last = chapter.year === 7;
  return (
    <section className="screen" aria-labelledby="chapter-title">
      <p className="mark">Placeholder</p>
      <img className="photo" src={`/api/photos/${chapter.year}`} alt="" />
      <p className="kicker">Year {yearWord[chapter.year - 1]}</p>
      <h1 id="chapter-title">{chapter.title}</h1>
      <Memory label="When and where" text={chapter.whenWhere} />
      <Memory label="What you were doing" text={chapter.doing} />
      <Memory label="A detail" text={chapter.detail} />
      <Memory label="Why it stayed" text={chapter.why} />
      <div className="screen-footer">
        {surprise ? (
          <button className="quiet" type="button" onClick={onNext}>
            {last ? "The last line" : "Next year"}
          </button>
        ) : (
          <>
            {onPrev ? (
              <button className="text-button" type="button" onClick={onPrev}>
                Previous
              </button>
            ) : (
              <span />
            )}
            {onClose ? (
              <button className="text-button" type="button" onClick={onClose}>
                Close
              </button>
            ) : null}
            {!last ? (
              <button className="quiet" type="button" onClick={onNext}>
                Next
              </button>
            ) : (
              <span />
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Memory({ label, text }: { label: string; text: string }) {
  return (
    <div className="memory">
      <p className="kicker">{label}</p>
      <p>{text}</p>
    </div>
  );
}

export function Closing({ story, onEnter }: { story: Story; onEnter: () => void }) {
  return (
    <section className="screen" aria-labelledby="closing-title">
      <p className="mark">Placeholder</p>
      <hr className="rule" />
      <p className="kicker">Year seven</p>
      <h1 id="closing-title" className="serif">
        {story.closing}
      </h1>
      <div className="screen-footer">
        <button className="quiet" type="button" onClick={onEnter}>
          Come in
        </button>
      </div>
    </section>
  );
}
