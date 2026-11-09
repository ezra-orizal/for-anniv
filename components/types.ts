export type Chapter = {
  year: number;
  title: string;
  whenWhere: string;
  doing: string;
  detail: string;
  why: string;
};

export type Story = {
  herName: string;
  anniversaryDate: string;
  doorLine: string;
  letter: {
    paragraphs: string[];
    signature: string;
  };
  chapters: Chapter[];
  closing: string;
  prompts: string[];
};

export type Moment = {
  id: string;
  happenedOn: string;
  title: string;
  body: string;
  photo: string | null;
  createdAt: string;
};

export type Step =
  | { name: "loading" }
  | { name: "door" }
  | { name: "choice" }
  | { name: "letter"; surprise: boolean }
  | { name: "chapter"; index: number; surprise: boolean }
  | { name: "closing"; surprise: boolean }
  | { name: "home" }
  | { name: "wander" }
  | { name: "keep" };

const OPENED = "anniv-opened";
const STEP = "anniv-step";

export function markOpened() {
  localStorage.setItem(OPENED, "1");
}

export function hasOpened() {
  return localStorage.getItem(OPENED) === "1";
}

export function rememberStep(step: Step) {
  if (step.name === "loading" || step.name === "door") {
    sessionStorage.removeItem(STEP);
    return;
  }
  if (step.name === "chapter") {
    sessionStorage.setItem(STEP, `${step.surprise ? "surprise" : "browse"}:year:${step.index}`);
    return;
  }
  if (step.name === "letter" || step.name === "closing") {
    sessionStorage.setItem(STEP, `${step.surprise ? "surprise" : "browse"}:${step.name}`);
    return;
  }
  sessionStorage.setItem(STEP, step.name);
}

export function savedStep(): Step | null {
  const saved = sessionStorage.getItem(STEP);
  if (!saved) return null;
  if (saved === "choice" || saved === "home" || saved === "wander" || saved === "keep") {
    return { name: saved };
  }
  const match = /^(surprise|browse):(letter|closing|year):?(\d+)?$/.exec(saved);
  if (!match) return null;
  const surprise = match[1] === "surprise";
  if (match[2] === "year") {
    const index = Number(match[3]);
    if (!Number.isInteger(index) || index < 0 || index > 6) return null;
    return { name: "chapter", index, surprise };
  }
  if (match[2] === "letter" || match[2] === "closing") {
    return { name: match[2], surprise };
  }
  return null;
}

export function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const yearWord = ["one", "two", "three", "four", "five", "six", "seven"];
