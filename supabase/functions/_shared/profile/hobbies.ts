import type { Hobby } from "./types.ts";

// ---------------------------------------------------------------------------
// DRAFT CONTENT — please edit.
//
// Blurbs marked [DRAFT] were written as a plausible starting point rather than
// from anything you told me. Read through and rewrite them in your own words;
// the AI quotes them closely. The football, acting, sightseeing, and faith
// entries are built from details you gave directly — check the wording anyway.
//
// To add a hobby: append an object here. To remove one: delete it. Nothing else
// in the app needs to change — the intent matcher, the system prompt, and the
// HobbiesCard all read from this array.
//
// MEDIA
// -----
// Each hobby can carry photos and clips. Drop files under `public/hobbies/<id>/`
// and reference them by path, or point `src` at an absolute URL. Anything that
// fails to load is dropped from the gallery at runtime, so the paths below are
// safe to leave in place until you add the files. See public/hobbies/README.md
// for the file list this expects and the size guidance for video.
//
// `icon` is a lucide-react icon name (https://lucide.dev/icons). An unknown
// name falls back to a neutral default.
// ---------------------------------------------------------------------------

export const hobbies: Hobby[] = [
  {
    id: "ai",
    label: "Technology & AI",
    icon: "BrainCircuit",
    blurb:
      "[DRAFT] Follows AI research and tooling closely, and spends free evenings testing whatever new model or agent framework has just shipped.",
    details: [
      "Reads about large language models, agents, and automation tooling in his own time.",
      "Enjoys taking a new API the week it launches and building something small with it to understand where it breaks.",
      "Particularly interested in where AI meets everyday support work — the unglamorous problems automation actually solves.",
    ],
    media: [],
  },
  {
    id: "programming",
    label: "Programming",
    icon: "Code2",
    blurb:
      "[DRAFT] Builds side projects to learn rather than to ship — mostly Python, with a growing amount of TypeScript and React.",
    details: [
      "Treats side projects as the way he learns: pick something slightly beyond his current level and finish it.",
      "Works mostly in Python, and has been picking up TypeScript and React through building this portfolio.",
      "Enjoys the debugging part more than the writing part — finding out why something behaves the way it does.",
    ],
    media: [],
  },
  {
    id: "football",
    label: "Football",
    icon: "Trophy",
    blurb:
      "A committed Manchester City supporter, with Kaizer Chiefs and Barcelona as the first teams he ever loved.",
    details: [
      "Manchester City is the club he follows most closely week to week.",
      "Kaizer Chiefs and Barcelona were his first football loves and he still follows both.",
      "Football is the standing break from screens — the thing he watches to switch the analytical part of his brain off.",
    ],
    media: [
      {
        kind: "image",
        src: "/hobbies/football/man_city.jpeg",
        alt: "Siba smiling in a light blue Manchester City home shirt on a grass field at golden hour",
        caption: "In the City shirt.",
      },
    ],
  },
  {
    id: "acting",
    label: "Acting & Film",
    icon: "Clapperboard",
    blurb:
      "Acted in a short film — an unexpected detour that turned into one of his favourite things he has done.",
    details: [
      "Took a role in a short film and came away with a real appreciation for how much work sits behind a few minutes of footage.",
      "Enjoyed the collaborative side of a set: lots of people solving small problems quickly under time pressure.",
    ],
    media: [
      {
        kind: "video",
        src: "/hobbies/acting/take1.mp4",
        alt: "Clip from the short film Siba acted in",
        caption: "A clip from the short film.",
      },
      {
        kind: "image",
        src: "/hobbies/acting/onset.jpeg",
        alt: "The crew filming a scene — camera operator, someone holding the script, and Siba in position",
        caption: "The crew mid-scene.",
      },
      {
        kind: "image",
        src: "/hobbies/acting/action.jpeg",
        alt: "A scene being filmed on a tripod-mounted camera, the shot visible on the flip-out screen",
        caption: "Rolling.",
      },
      {
        kind: "image",
        src: "/hobbies/acting/acting.jpeg",
        alt: "A camera operator filming a scene over the shoulder",
        caption: "Behind the camera.",
      },
    ],
  },
  {
    id: "sightseeing",
    label: "Sightseeing & Views",
    icon: "Mountain",
    blurb:
      "Goes looking for good views. Cape Town makes that easy, and he collects the ones worth going back to.",
    details: [
      "Seeks out scenic spots and aesthetic views, and films the ones worth remembering.",
      "Being based in Cape Town means most of the good ones are a short drive away.",
    ],
    media: [
      {
        kind: "video",
        src: "/hobbies/sightseeing/views.mp4",
        alt: "Video of a scenic view Siba filmed",
        caption: "One of the views worth going back to.",
      },
      {
        kind: "image",
        src: "/hobbies/sightseeing/beach.jpeg",
        alt: "Siba at the coast beside Lionel Smit's Assemble sculpture, with the sea and mountains behind",
        caption: "By the Assemble sculpture, out on the coast.",
      },
    ],
  },
  {
    id: "faith",
    label: "Faith & Church",
    icon: "Church",
    blurb: "Attends church regularly — a steady part of his week rather than an occasional thing.",
    details: [
      "Church is a regular fixture in his week and a grounding one.",
      "Values the community side of it as much as the quiet.",
    ],
    media: [
      {
        kind: "image",
        src: "/hobbies/faith/church.jpeg",
        alt: "Siba worshipping with the congregation during a church service",
        caption: "During the service.",
      },
    ],
  },
  {
    id: "anime",
    label: "Anime",
    icon: "Tv",
    blurb:
      "[DRAFT] A long-running interest — drawn to series with strong world-building and characters who grow through genuine setbacks.",
    details: [
      "Prefers stories with real stakes and characters who change, over pure action.",
      "Enjoys the craft side too: the animation, the score, and how a long series paces its arcs.",
    ],
    media: [],
  },
  {
    id: "psychology",
    label: "Psychology & Human Behaviour",
    icon: "Users",
    blurb:
      "[DRAFT] Fascinated by why people do what they do — which turns out to be most of the job in customer support.",
    details: [
      "Reads about behavioural psychology, motivation, and how people make decisions under pressure.",
      "Finds it directly useful at work: a frustrated customer is usually communicating something other than the literal complaint.",
      "Completed coursework in emotional intelligence, conflict resolution, and cultural intelligence.",
    ],
    media: [],
  },
  {
    id: "growth",
    label: "Personal Development",
    icon: "TrendingUp",
    blurb:
      "[DRAFT] Consistently working through courses and certifications — the certificate list is the visible part of a steady learning habit.",
    details: [
      "Treats continuous learning as a routine rather than a push before a job application.",
      "Interested in resilience, grit, and growth mindset as practical tools, not slogans.",
      "Keeps a deliberate mix of technical and non-technical learning going at the same time.",
    ],
    media: [],
  },
];
