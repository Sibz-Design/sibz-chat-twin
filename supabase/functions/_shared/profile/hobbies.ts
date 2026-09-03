import type { Hobby } from "./types.ts";

// ---------------------------------------------------------------------------
// DRAFT CONTENT — please edit.
//
// Every entry is now built from details you gave directly — no placeholder copy
// remains. The AI quotes these closely, so tweak the wording whenever it drifts
// from how you would actually say it.
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
      "Always learning AI, and increasingly building with it — gradually leaving his vibe coding tendencies behind, one commit at a time.",
    details: [
      "Learning AI continuously rather than in bursts, and putting it straight to work in what he builds.",
      "Developing with AI as a tool rather than a crutch: less vibe coding, more understanding what the code actually does.",
      "Particularly interested in where AI meets everyday support work — the unglamorous problems automation actually solves.",
    ],
    media: [],
  },
  {
    id: "programming",
    label: "Programming",
    icon: "Code2",
    blurb:
      "Currently on the FNB App Academy, sharpening his programming fundamentals alongside the projects he builds for himself.",
    details: [
      "Part of the FNB App Academy, working through it to strengthen his programming skills properly rather than picking things up ad hoc.",
      "Works mostly in Python, and has been picking up TypeScript and React through building this portfolio.",
      "Treats side projects as the way he learns: pick something slightly beyond his current level and finish it.",
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
    blurb: "Bleach is his favourite — the one he measures everything else against.",
    details: [
      "Bleach sits at the top of the list.",
      "Drawn to long series with real stakes, strong world-building, and characters who grow through genuine setbacks.",
    ],
    media: [],
  },
  {
    id: "psychology",
    label: "Psychology & Human Behaviour",
    icon: "Users",
    blurb:
      "Reads about psychological facts constantly. Quantum leaping is the topic he keeps coming back to.",
    details: [
      "Reads and learns about psychological facts continuously — it is the subject he returns to most outside of tech.",
      "Quantum leaping is his favourite topic within it.",
      "Finds the wider interest directly useful at work: a frustrated customer is usually communicating something other than the literal complaint.",
      "Completed coursework in emotional intelligence, conflict resolution, and cultural intelligence.",
    ],
    media: [],
  },
  {
    id: "growth",
    label: "Personal Development",
    icon: "TrendingUp",
    blurb:
      "Getting out to see new places, and heading home every so often to reset.",
    details: [
      "Makes a point of going out and seeing places rather than staying put.",
      "Goes home every so often — the trips back are the proper reset.",
    ],
    media: [],
  },
];
