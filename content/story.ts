import "server-only";

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

const story: Story = {
  herName: "Her name",
  anniversaryDate: "The anniversary date",
  doorLine: "Open this when you are alone.",
  letter: {
    paragraphs: [
      "Placeholder. This is the season it became real, still waiting for the true story.",
      "Placeholder. This is a year that was hard, and the fact that you stayed.",
      "Placeholder. This is one ordinary day you still think about.",
      "Placeholder. This is what you want the next year to feel like.",
    ],
    signature: "Your name",
  },
  chapters: [
    {
      year: 1,
      title: "Placeholder title for year 1",
      whenWhere: "Placeholder. When and where it started.",
      doing: "Placeholder. What you were doing on the day it became serious.",
      detail: "Placeholder. A detail only she would remember from the beginning.",
      why: "Placeholder. Why the first year stayed.",
    },
    {
      year: 2,
      title: "Placeholder title for year 2",
      whenWhere: "Placeholder. The first place that felt like yours.",
      doing: "Placeholder. What you were doing there.",
      detail: "Placeholder. A sound, a meal, or a light she would still know.",
      why: "Placeholder. Why that place stayed.",
    },
    {
      year: 3,
      title: "Placeholder title for year 3",
      whenWhere: "Placeholder. When and where you got through something together.",
      doing: "Placeholder. What you were doing while it was hard.",
      detail: "Placeholder. A detail only she would remember from that stretch.",
      why: "Placeholder. Why you still keep that year.",
    },
    {
      year: 4,
      title: "Placeholder title for year 4",
      whenWhere: "Placeholder. A trip, or a day that still looks like a photograph.",
      doing: "Placeholder. What you were doing in the picture.",
      detail: "Placeholder. The weather, the street, or the thing she said.",
      why: "Placeholder. Why you can still see it.",
    },
    {
      year: 5,
      title: "Placeholder title for year 5",
      whenWhere: "Placeholder. The route, the table, or the Sunday that became a ritual.",
      doing: "Placeholder. What you did every time.",
      detail: "Placeholder. The small thing that made it yours.",
      why: "Placeholder. Why the ritual stayed.",
    },
    {
      year: 6,
      title: "Placeholder title for year 6",
      whenWhere: "Placeholder. When and where you were proud of her.",
      doing: "Placeholder. What she was doing.",
      detail: "Placeholder. What you noticed and did not want to forget.",
      why: "Placeholder. Why that pride stayed.",
    },
    {
      year: 7,
      title: "Placeholder title for year 7",
      whenWhere: "Placeholder. The most recent day you were sure.",
      doing: "Placeholder. What you were doing.",
      detail: "Placeholder. A detail only she would remember from lately.",
      why: "Placeholder. Why you are still sure.",
    },
  ],
  closing:
    "Placeholder. You will be here for year 8, with a new story to put in this place.",
  prompts: ["A day worth keeping", "Something she said", "A place to go back to"],
};

export function getStory(): Story {
  return story;
}
