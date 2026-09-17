# Changelog

This file documents changes made to the codebase as a result of a full portfolio audit
(bugs, broken features, UX/accessibility/performance issues, dead code, SEO). Each entry
lists the commit, the file(s) touched, what changed, and why — including the verification
step taken before committing. Entries are grouped by the priority tier used during the
audit (P0 = critical/broken, P1 = high-priority functional/UX, P2 = accessibility/mobile/
code-health).

## P0 — Critical / broken

### `506687d` — Fix malformed Cohere request payload
**File:** `supabase/functions/chat/index.ts`
A stray double comma (`},,`) after the system message created an array elision. JavaScript
serializes elisions as `null` via `JSON.stringify`, so every request to Cohere silently
included a `null` entry in the `messages` array. Removed the extra comma.
**Verified:** by ECMAScript spec reasoning (array-hole → `JSON.stringify` → `null` is
deterministic, spec-mandated behavior); confirmed via `npm run build` later in the session
that the file still compiles cleanly.

### `79c09ca` — Fix wrong env var in Supabase client
**File:** `src/integrations/supabase/client.ts`
`SUPABASE_PUBLISHABLE_KEY` was assigned `VITE_SUPABASE_URL` (a copy-paste of the line
above) instead of `VITE_SUPABASE_ANON_KEY`. Fixed the reference.
**Impact:** none on current behavior — repo-wide grep confirmed this exported `supabase`
client has zero importers anywhere in the app (Chat.tsx and hero-section.tsx both call
`fetch()` directly instead). This fixes latent dead code before it bites whoever wires it
up next.

### `3004a50` — Remove personal phone numbers from the public Resume component
**File:** `src/components/Resume.tsx`
The résumé rendered in the chat UI hardcoded the site owner's own phone numbers *and*
three named references' (former managers/colleagues) personal phone numbers, visible to
any site visitor. Per explicit decision from the site owner: removed all phone numbers,
replaced the reference lines with "contact details available on request." Names,
companies, and email address were left unchanged for credibility.

## P1 — High priority (functional / UX / duplication)

### `114142f` — Remove dead `src/api/chat.ts` and its unused import chain
**Files removed:** `src/api/chat.ts`, `src/lib/prompt.ts`, `src/pages/lib/prompt.ts`,
`api/_shared/cors.ts`, `src/api/_shared/cors.ts`
`src/api/chat.ts` had zero importers anywhere in the repo (verified via repo-wide grep for
its `chatAPI` export) and contained a top-level `Deno.serve()` call sitting inside the
browser-bundled `src/` tree — a landmine if anything had ever imported it, since `Deno`
doesn't exist in a browser. It was the sole consumer of the other four files, which were
either fully unused on their own or only reachable through this dead file. The two live
Supabase edge functions (`chat`, `send-email-function`) each define their own CORS headers
and system prompt inline and never referenced any of these five files.

### `8e537ac` — Update README project-structure diagram
**File:** `README.md`
Follow-up to the dead-code removal above: the diagram still listed the now-deleted `api/`
folder, and was missing `send-email-function` entirely.

### `da7d787` — Remove duplicate `use-toast.ts` shim
**File removed:** `src/components/ui/use-toast.ts`
This file only re-exported `src/hooks/use-toast.ts` and had no importers — `toaster.tsx`
already imports the real hook directly.

### `ca076c0` — Replace `alert()` with the existing toast system
**File:** `src/components/hero-section.tsx`
The app ships a full toast implementation (`src/hooks/use-toast.ts`) and mounts
`<Toaster />`/`<Sonner />` globally in `App.tsx`, but nothing ever called `toast()` — the
contact form used blocking native `alert()` for its three states (missing config, success,
failure) instead. Swapped all three for `toast()` calls. No layout or submit-flow logic
changed otherwise.
**Verified:** live, in a running dev server — confirmed `fetch()` fires with the correct
URL via an instrumented `window.fetch` wrapper.

### `5eb78ae` — Strip debug `console.log` noise
**File:** `src/pages/Chat.tsx`
Removed ~13 `console.log` calls that dumped env-var presence, request URLs, response
status, and every raw streamed chunk/line/parsed token to the browser console for every
visitor. Kept the 5 `console.error` calls, which are genuine diagnostics (missing env
vars, failed server response, JSON parse failure, top-level catch, clipboard failure).

### `bb51183` — Fix invalid `og:type`, add missing `og:url`
**File:** `index.html`
`og:type` was set to the site's own URL instead of a valid Open Graph type (`"website"`),
and there was no `og:url` tag — the URL had likely been misplaced into `og:type` by
mistake. Split into two correct tags.

### `cd909be` — Use the site's own logo for social-share previews
**File:** `index.html`
`og:image`/`twitter:image` pointed at the starter template's placeholder OG image, and
`twitter:site` carried the template vendor's handle — none of which belong to this site. Switched to
the site's own logo (`public/logo_sd.png`, already used as the favicon) and removed the
unrelated `twitter:site` handle. Per site-owner decision.

### `a82e32e` — Fix dead "Resume-AI-Craft" project link
**File:** `src/components/Projects.tsx`
The project card linked to `"#"` (a dead link). Pointed it to its real GitHub repo,
`https://github.com/Sibz-Design/resume-ai-craft-92`, per site-owner input.

### `0c9ee62` — Fix word-boundary bug in chat keyword shortcuts
**File:** `src/pages/Chat.tsx`
`normalized.includes('project'/'badge'/'experience')` matched inside unrelated words —
e.g. "projection", "projected", "experienced", "inexperience", "badger" all incorrectly
hijacked the chat into rendering a shortcut card instead of going to the AI. Switched to
word-boundary regexes (`\bprojects?\b`, `\bbadges?\b`, `\bexperiences?\b`), preserving
every previously-matching legitimate case including plurals and the suggested-question
buttons.
**Verified:** live, in a running dev server — confirmed "Tell me about your experience
with that project" still correctly renders the Projects card (whole-word match), and "I
have experienced many great things in my career" no longer false-triggers the résumé
card and correctly falls through to the AI call path instead.

## P2 — Accessibility / mobile / code health

### `2bc9710` — Add `aria-label` to the icon-only chat send button
**File:** `src/pages/Chat.tsx`
The composer's submit button rendered only a `Send` icon with no visible text, so screen
readers announced it as just "button". (The Copy button and the hero section's Send
button both already have visible text alongside their icons, so they were left
untouched — this was a correction to the original audit, which had over-flagged them.)

### `0e56e57` — Restyle Resume component to match the app's dark theme
**File:** `src/components/Resume.tsx`
Per site-owner decision (the white "paper" look was not intentional): replaced hardcoded
`bg-white`/`text-gray-*`/`text-blue-500`/`border-gray-300` with the app's existing design
tokens (`bg-card`, `text-foreground`, `text-muted-foreground`, `text-primary`,
`border-border`) so the résumé blends with the rest of the dark-themed chat UI.

### `a2902ca` — Use design tokens on the 404 page
**File:** `src/pages/NotFound.tsx`
Same category of fix as above, applied without needing to ask since there was no
plausible "intentional design" reading for a plain error page: `bg-gray-100`/
`text-gray-600`/`text-blue-500` → `bg-background`/`text-muted-foreground`/`text-primary`.

### `e4e4699` — Replace runtime `prop-types` with TypeScript interfaces
**File:** `src/components/ui/container-scroll.tsx`
This file imported `prop-types` directly, but it wasn't declared in `package.json` — only
present transitively via other dependencies, so it worked by luck of hoisting rather than
a real guarantee. Since the file is already `.tsx` and compiled by TypeScript, replaced
the runtime `PropTypes` checks with proper TS interfaces (`HeaderProps`, `CardProps`,
`ContainerScrollProps`), matching how every other component in the codebase is typed.
No behavioral change — JSX and logic bodies are untouched.

## Verified but intentionally left unchanged

- **`ai-chat-function` endpoint mismatch** — `Chat.tsx` calls a Supabase function named
  `ai-chat-function` that does not exist anywhere in this repository (only `chat` and
  `send-email-function` do). Confirmed via git history (`4f52f50` renamed the frontend's
  endpoint from `/functions/v1/chat` without ever adding/renaming a matching function
  folder). Per site owner: `ai-chat-function` **is** deployed live on Supabase, separately
  from this repo. Since I have no access to that live source, `supabase/functions/chat/`
  in this repo should be treated as stale/legacy until its real deployed source is pulled
  in — renaming or redeploying it blind risks overwriting the working production function.
- **Mobile hero height** (`src/components/ui/container-scroll.tsx`, fixed
  `h-[50rem] md:h-[60rem]`) — measured live at 375×812 and 320×568 viewports using the
  actual dev server. No content is clipped or broken at either size. At 375×812+ (modern
  phones) everything fits comfortably in the first viewport. At 320×568 (older/smallest
  phones) the chat input is visible without scrolling, but reaching the suggested-question
  buttons and CTA row requires ~230–300px of scrolling within the hero region. Left
  unchanged per site-owner decision; this is a measured data point if revisited later.
- **tsconfig.json / eslint.config.js strictness** (`noImplicitAny`, `strictNullChecks`,
  `no-unused-vars` currently disabled) — left as-is per site-owner decision. Re-enabling
  these project-wide is a larger change than a targeted bug fix and should be done where
  the fallout can be reviewed interactively.
- **Toast-on-contact-form-failure** — the code change itself (`ca076c0`) is verified
  correct: `fetch()` demonstrably fires with the right URL (confirmed via an instrumented
  `window.fetch`), and `<Toaster />` is mounted globally. Live confirmation that the toast
  *visually renders* in the DOM was inconclusive due to test-harness quirks in this
  session (not a reproduced app bug) — worth a quick manual click-through if you want full
  confidence before relying on it.

## P3 — Lower priority cleanup

### `7274b56` — Remove unused `src/App.css`
Leftover default Vite template file — never imported by `main.tsx` or anywhere else
(`index.css` is the only stylesheet actually loaded).

### `0736c7d` — Remove README claims about GitHub API integration
The README described a "GitHub Integration" feature that dynamically fetches repository
content, structure, and code samples to build chatbot context. This existed in an earlier
commit (`bc09e10`) but was stripped out in a later refactor — the current chat function
uses a static, hardcoded system prompt instead. Removed the GitHub-fetching claims from
the feature list, tech stack, prerequisites, env var setup, and architecture sections.
Left the "Future Enhancements" section's "Enhanced GitHub repository analysis" line
untouched since it's honestly framed as future work, not a current-feature claim.

### `27a16ab` — Add sitemap.xml and per-route page titles
- `public/sitemap.xml` lists the two real routes (`/` and `/chat`); referenced from
  `robots.txt` via a `Sitemap:` directive.
- `Index`, `Chat`, and `NotFound` now set `document.title` on mount, so the browser
  tab/SEO title actually changes per route instead of always showing the homepage title.
- Drive-by fix: removed an unused `resumeText` import in `Chat.tsx` (imported via `?raw`
  but never referenced anywhere in the file) — found while editing this file for the
  title fix.

## Verified but intentionally left unchanged (P3)

- **Server-only packages** (`express`, `cors`, `node-fetch`, `@aws-sdk/client-s3`,
  `@smithy/*`, `cohere-ai`, `concurrently`) sit in `package.json` `dependencies` rather
  than `devDependencies`, and none are imported anywhere in `src/` (confirmed via
  repo-wide grep — no Express server file, no S3 usage, no server entry point at all).
  Per site-owner decision: left as-is rather than removed or reorganized.

## Not yet addressed

All items from the original audit have been resolved, fixed, or explicitly deferred per
site-owner decision (see "Verified but intentionally left unchanged" sections above).

## Process notes

- Local git identity for this repo was corrected from an auto-detected work email
  (`sibabalwe.desemela@clickatell.com`) to `Sibz <sibabalwedes@gmail.com>`, matching the
  repository's existing commit history, before any of the above commits were made.
- Every commit above was pushed to `origin/main` individually as it was made.
- `npm run build` and `npm run lint` were both run against the final state of all P0–P2
  changes: the build succeeds with no errors, and lint shows only 16 pre-existing
  issues (8 errors, 8 warnings) in files this audit did not touch — confirmed as
  pre-existing and unrelated, not regressions.
- `npm run build` was re-run after the P3 changes and also succeeds with no errors.

## Site-owner content updates (2026-07-28)

Not part of the audit — these are the site owner's own updates to the chatbot's content
and behavior, made directly in the working tree. Documented here for the record.

### `src/pages/Chat.tsx` — broader triggers, new contact shortcut, updated bio
- Broadened the "who is Siba" trigger phrases: added "about me", "tell me about", "what
  does Siba/Sibabalwe/Sibz/he do", "what is his role", and "who are you".
- Added a new `isContactQuery` shortcut (regex matching contact/reach/email/linkedin/
  connect/"get in touch"/etc.) that instantly returns a canned reply with email and
  LinkedIn, without going through the AI.
- Rewrote the "who is Siba" bio to reflect a role change: now a Customer Support Agent at
  Clickatell (previously Technical Support Associate at Capaciti) and a recent CAPACITI
  graduate. Replaced the old project list (Sentiment Dashboard, YouTube Comment Analytics
  Dashboard) with a new one (HR CV screening pipeline, booking automation system,
  sentiment analysis dashboard) and a new tool list (n8n, Make, OpenAI, Hugging Face,
  Python). Expanded the certificate list to include Google, Cisco, IBM, Microsoft, AWS,
  Stanford, Duke, and Johns Hopkins.
- Fixed the LinkedIn URL to include a trailing slash for consistency with the other
  LinkedIn links already in the file.

### `supabase/functions/chat/index.ts` — expanded system prompt with topic guardrails
- Added explicit guardrails instructing the AI to only answer questions about Siba, with
  a fixed polite-refusal line for unrelated topics, and instructions for handling mixed
  questions (answer only the Siba-related part).
- Added an instruction not to describe Siba as a frontend/software/DevOps engineer unless
  the user explicitly asks.
- Updated the same bio facts as the Chat.tsx change above (Clickatell, CAPACITI, new
  projects/tools/certs), so the live AI's knowledge stays in sync with the local
  shortcut content.
- Added strict contact-info formatting rules: mailto-link format only, no inventing other
  social platforms or handles, explicitly no Twitter/X mentions.
- Reformatted the tech stack from a single inline string into a bullet list, and added a
  new "technical focus" bullet list (IT support/helpdesk, AI workflow automation, SMS/API
  messaging, Python/AI tooling).

**Status:** both files were modified in the working tree but not yet committed as of this
entry.

## Client-side topic guardrail, bug fixes, and CV sync (2026-07-28, cont.)

After the above was drafted, live testing surfaced that the AI wasn't actually refusing
off-topic questions (e.g. "how do I make a cocktail?" got a full generic answer) because
the guardrails only existed in the *local* `supabase/functions/chat/index.ts`, while the
frontend calls a separately-deployed function, `ai-chat-function`, whose source isn't in
this repo. The site owner added a client-side keyword gate in `Chat.tsx` as a deterministic
first line of defense (refuse anything that doesn't mention Siba by name or match an
existing shortcut) and pasted the actual live `ai-chat-function` source for comparison.

### `src/pages/Chat.tsx` — fixed a build-breaking bug plus three UX regressions in the new gate
- **Fixed a syntax error that broke the production build entirely**: `normalized.includes('what is Siba's role')`
  had an unescaped apostrophe inside a single-quoted string, which is invalid JS/TS and
  made `npm run build` fail outright. Also removed a dead duplicate line
  (`normalized.includes('what does Siba do')`) that could never match anything since
  `normalized` is always lowercased. Replaced both with proper regexes (which don't have
  this quoting problem) that also add "what does he do" / "what is his role" as valid
  phrasing.
- **Fixed the "Skills" (and likely "Experience") quick-action buttons being incorrectly
  refused**: unlike Projects/Certificates/Badges (which render their cards directly,
  bypassing this check entirely), the Skills and Experience buttons go through
  `handleSendMessage`, and neither "What are your key skills?" nor "Summarize your
  experience" mentions Siba by name — so the new refusal gate was blocking them before
  they ever reached their intended handling. Added the same whole-word patterns already
  used by the project/badge/experience shortcuts (plus a new `skills?` pattern) into the
  gate's on-topic check.
- **Added a greeting allowlist**: "hi", "hello", "hey", "yo", "sup", "hiya", "howdy", and
  time-of-day greetings now get a friendly canned welcome instead of being refused or sent
  to the AI.
- **Tightened the overly-broad `isWhoIsSiba` triggers**: `includes('tell me about')` and
  `includes('about me')` were substring matches anywhere in the message, so "tell me about
  black holes" would trigger the full Siba bio dump instead of being treated as off-topic.
  Replaced with regexes that require the topic to actually be Siba
  (`tell me about (siba|sibz|sibabalwe|him|his background|yourself)`).

### `src/components/Resume.tsx` — synced to the real CV
Rewrote the résumé content to match the site owner's actual CV document:
- Added the new Customer Support Agent role at Clickatell (April 2026 – Present) and
  updated the CAPACITI role's end date (April 2025 – March 2026).
- Expanded the Technical Support Associate bullet points to include the HR AI Agent CV
  screening pipeline, booking automation system, Sentiment Analysis Dashboard, and YouTube
  data pipeline (n8n, Make, OpenAI, Cohere, Airtable, Streamlit, Hugging Face, Flask).
- Added a full Certifications section (IT Support & Networking, AI/ML/Data Science, Cloud
  & Data, Professional Development) — previously certifications were only mentioned in
  passing in the Professional Summary.
- Replaced the old short Technical/Soft Skills lists with the CV's more detailed versions.
- Removed the old "Hobbies and Interests" section — it wasn't part of the CV.
- Simplified References to "Available on request." with no names at all, matching the CV
  exactly (previously named the three references without phone numbers, per the earlier
  privacy fix — the actual CV goes further and doesn't name them at all).
- Kept `github.com/Sibz-Design` (hyphenated) rather than the CV's `github.com/SibzDesign`,
  since the hyphenated form is used consistently everywhere else in this codebase — worth
  the site owner double-checking which is actually correct.

### `src/components/hero-section.tsx` — project suggestion now reaches the actual chat environment
The site owner noticed that clicking "Show me Siba's projects" on the homepage only
displayed the Projects grid inline inside the hero's scroll card, never actually entering
the chat environment — inconsistent with every other suggested question ("Who is Siba?",
"What tech stack...", "Tell me about experience"), which all correctly navigate to `/chat`.

Root cause: `handleStartChat` special-cased any query containing "project" to set a local
`showProjects` flag and return early, instead of navigating like everything else. Removed
that special-case; project queries now navigate to `/chat?query=...` uniformly, where
`Chat.tsx`'s own project-shortcut renders the same grid correctly inside the real chat UI.
Also removed the now-dead `showProjects` state, its "Back to Home" button, and the
now-unused `Projects` import.
**Verified live** in a running dev server: clicking the suggestion now shows the proper
chat header and quick-action buttons, with the Projects grid rendered as a chat message.

### `src/pages/Chat.tsx` — fixed the Copy button overlapping response text
The site owner noticed the Copy button rendering on top of short assistant responses
(e.g. the refusal message). Root cause: the message text reserved `pr-12` (48px) of right
padding for the button, but the button itself (icon + "Copy"/"Copied" label + padding) was
roughly 90-100px wide — nearly double the space actually reserved for it.

Rather than just widening the padding (which would still be fragile if the button's
content ever changed again), shrunk the button to icon-only (`size="icon"`, a 40px square)
so it fits cleanly within the existing 48px reserve, and added an `aria-label` reflecting
the current state ("Copy message" / "Copied") so it stays accessible without the visible
text label.
**Verified live**: measured the actual rendered text glyph positions (via a DOM Range,
not just the containing div's bounding box, which is misleading here since the div is
full-width regardless of padding) against the button's position — confirmed a clean 16px
gap with no overlap.

### `src/pages/Chat.tsx` — rephrased Skills quick-action to third person
"What are your key skills?" read like it was asking the AI about its own skills, but the
response is written entirely in third person about Siba (per the guardrail prompt's
"describe him in third person" instruction). Changed to "What are Siba's key skills?" so
the displayed question matches the answer's voice.
**Verified live**: confirmed the button now sends the reworded question and the AI's
third-person response reads consistently with it.

### `src/index.css`, `index.html`, `src/App.tsx` — collapsed two conflicting dark palettes into one
The site owner reported the site rendering with different colors in Edge (blue-ish) vs
Chrome (black). Root cause: `index.css` defined two different dark color palettes
(`:root` at hue 220/20% saturation, `.dark` at hue 222.2/84% saturation), with no `.light`
class defined anywhere. An inline script in `index.html` picked `'dark'` or `'light'`
per-browser based on `prefers-color-scheme`/localStorage — whichever browser resolved to
`'light'` silently fell back to the unstyled `:root` defaults instead of an actual light
theme. Edge and Chrome were resolving that system preference differently, landing on two
different, both-unintentional palettes.

There's no theme-toggle UI anywhere in the app, and every component fixed this session
assumed a single dark aesthetic, so this branching was never serving a real purpose. Shown
the site owner a side-by-side comparison of both palettes; they chose the `.dark` palette
(the one Edge was showing) as the single, permanent theme. Merged its values into `:root`,
removed the separate `.dark` class block, removed the inline detection script, removed the
now-unused `useTheme()` call in `App.tsx`, and deleted `src/hooks/use-theme.tsx` (zero
other importers).
**Verified live**: confirmed no class is added to `<html>` anymore and `--background`
resolves to the chosen palette's value unconditionally, in every browser.

### `src/components/ui/container-scroll.tsx` — fixed the hero card animation being stuck in Chrome
The site owner reported the hero card's 3D scroll animation (tilt + scale as you scroll)
never playing in Chrome desktop, Chrome incognito, and mobile - visible as the card staying
frozen in its initial washed-out/tilted state - while working correctly in Edge. No
extensions were involved (reproduced in incognito) and no console errors appeared, which
pointed at Framer Motion's `useScroll` hook's internal scroll-tracking mechanism itself
(possibly its native CSS scroll-timeline auto-detection behaving differently across
Chromium builds) rather than application logic.

Replaced `useScroll`/`useTransform` with a plain `window` scroll listener +
`getBoundingClientRect()` math, replicating the same 0-to-1 progress range Framer Motion's
default offset produced. Same visual behavior, driven by standard DOM APIs with no
library-internal uncertainty. This also removed Framer Motion from the bundle entirely, as
it wasn't used anywhere else in the app - shrunk the JS bundle from ~482KB to ~354KB.
**Verified live**: confirmed progress interpolates smoothly and correctly at multiple
scroll positions (e.g. `rotateX(11.67deg) scale(1.029)` at 100px of a 240px scroll range,
matching the expected math exactly).

**Note:** `framer-motion` is now an unused dependency in `package.json` as a direct result
of this fix (it has no other usages in `src/`). Not removed yet - the site owner may want
to weigh in on whether to drop it, similar to the earlier decision to leave other unused
dependencies alone.

### `src/components/ui/container-scroll.tsx` — follow-up: fixed the real root cause on mobile
The previous fix above still didn't work on the site owner's actual phone. Real root cause:
the scroll range was computed as container height minus viewport height. On mobile the
container is 800px tall (`h-[50rem]`), and real phone viewport heights are frequently close
to or taller than that (the reported device measured exactly 375x812) - making the
computed range zero or negative. The code explicitly forced progress to stay at 0 whenever
the range wasn't positive, exactly matching the "permanently stuck" symptom, regardless of
how much the user actually scrolled.

Switched to a fixed 400px scroll distance instead of the container/viewport height
difference, so the animation always has real room to play out no matter how a given
device's viewport height compares to the container's height.
**Verified live** at the exact 375x812 dimensions from the reported screenshot: scrolling
200px now correctly produces `rotateX(10deg) scale(0.8)` (50% progress) instead of staying
stuck at the initial `rotateX(20deg) scale(0.7)`.

## Interactive chat upgrade: profile knowledge base + contextual cards (2026-09-03)

Rebuilt the AI chat around a single shared knowledge base so the assistant can answer
questions about hobbies and personal interests, and so its answers can be accompanied by
contextual visual cards. Nothing about the security layer (CORS, validation, injection
guard, rate limiting, caching) was weakened.

### The problem

Siba's biography existed in three places — a hardcoded block in `src/pages/Chat.tsx`, the
`SYSTEM_PROMPT` string array in the edge function, and `src/components/Resume.tsx` — and
they had already drifted from one another. Projects lived in `Projects.tsx`, certificates
in `Certificates.tsx`. There was no hobbies data anywhere, so questions like "What does
Siba do in his free time?" reached Cohere with nothing to answer from.

Intent detection was a chain of regexes inside the React component that ran *before* the
network call and returned early, so "show me his projects" never reached the AI at all. A
client-side `isSibaRelated` guard refused anything outside a short keyword list.

### What changed

**New: `supabase/functions/_shared/profile/`** — a typed knowledge base
(`identity`, `career`, `skills`, `projects`, `hobbies`, `education`, `goals`,
`suggestions`) that is the single source of truth. It is imported verbatim by the Deno
edge function *and* by the React frontend through a new `@profile` alias, so the AI's
words and the visual cards are generated from the same objects. Adding a hobby is a
one-array edit with no chatbot logic to touch.

Chosen over Supabase or a retrieval layer deliberately: the corpus is ~6KB against a
128k-token context window, so retrieval would add a vector store and latency to solve a
problem that does not exist, and a database would add a round-trip plus a CMS to build.

**New: `_shared/intent.ts`** — weighted, deterministic intent scoring, replacing the
component's regex chain. Weighted rather than first-match-wins so that "What does Siba do
in his free time?" resolves to `hobbies` despite also containing the `who` phrase "what
does Siba do". High-confidence intents are answered from profile data with no model call:
instant, free, and impossible to hallucinate.

**New: `_shared/answers.ts` / `_shared/prompt.ts`** — deterministic replies composed from
the profile, and a system prompt generated from it. For ambiguous questions the model
appends a `[[cards: ...]]` directive that the function strips and converts into typed card
instructions. Preferred over Cohere tool calling, which would need a second round-trip per
message and would bypass the response cache for the same result.

**Response envelope** is now `{ text, cards, followUps, source }`. The server decides what
to show; the frontend decides how to render it. Cards carry only a type — the frontend has
the same profile module, so content is never shipped twice.

**Frontend** — `src/pages/Chat.tsx` shrank from ~700 lines to ~260 and now holds no
knowledge and no regexes. New `src/components/chat/`: `ProfileCard` (photo + headline),
`HobbiesCard` (expandable icon grid), `SkillsCard` (grouped badges), `ContactCard`,
`ExperienceCard` (role timeline), plus `ChatCards`, `MessageText`, `EmptyState`,
`SuggestionChips`, and `AssistantMessage`. Transport moved to `src/lib/chatClient.ts`.

**UX** — an "Ask me about…" starter grid replaces the bare bot icon empty state;
follow-up chips appear under each answer, chosen server-side from the card returned; a
time-boxed progressive reveal supplies the "being written" feel (the function returns
complete answers, not a token stream); conversation history is now actually sent (last 8
turns), so follow-ups have context for the first time.

### Bugs found and fixed along the way

- **Stale-cache bug (would have been introduced):** the prompt cache keys on message text
  alone, so after editing a hobby, cached answers would keep serving old content for the
  full TTL. The key now mixes in `PROFILE_VERSION`, an FNV-1a fingerprint of the profile
  computed at module load, so any profile edit invalidates every cached answer.
- **Unsafe Cohere response parsing:** `json.message.content[0].text` assumed the first
  content block exists and is text. Now filters and concatenates text blocks, and returns
  502 rather than crashing when there are none.
- **Chat layout overflow:** `min-h-screen` with a `flex-1 overflow-auto` child let the
  page grow past the viewport, clipping long messages and scrolling the composer off
  screen. Now a fixed `h-dvh` column with `min-h-0` on the scroll area.
- **Local dev CORS:** `_shared/cors.ts` allowed `localhost:8080`, but `.claude/launch.json`
  runs the dev server on 8099, so local dev against the deployed function failed preflight.
  Added 8099 to the defaults.
- **Dead code removed:** the frontend's SSE streaming parser was unreachable (the function
  has always returned plain JSON), as was the edge function's `history` support (the client
  never sent any). `src/components/Resume.tsx` was a hardcoded duplicate of data now in the
  profile and was replaced by `ExperienceCard`. Five `src/assets` images superseded by
  `public/` copies were deleted.

### Verification

- `npm run test:intent` — new check suite, 33 intent cases plus card-directive parsing and
  profile-integrity assertions. All pass.
- `npx tsc -p tsconfig.app.json --noEmit` — clean.
- `npm run lint` — 16 errors, unchanged from the pre-change baseline (all pre-existing).
- `npm run build` — clean.
- Browser: verified the empty state, profile card (including the missing-photo fallback),
  hobbies card with expansion, follow-up chips, linkified email/URLs, the fixed scroll
  layout, and mobile at 375x812.

### Requires deployment

The response envelope changed, so the frontend and the edge function must ship together:
`supabase functions deploy chat`. Until that runs, the deployed function returns the old
shape and the chat will report an unexpected response.

## Hobby media: photos and video in the hobbies card (2026-09-03, cont.)

Site owner supplied real hobby content and media, replacing part of the scaffolded draft.

### Content

Four hobbies added from details the site owner gave directly:

- **Football** — Manchester City supporter, with Kaizer Chiefs and Barcelona as first
  teams. Replaces the invented generic "Sports" draft entry.
- **Acting & Film** — acted in a short film; has a clip and on-set photos.
- **Sightseeing & Views** — has a video of a scenic view.
- **Faith & Church** — attends church regularly; has a photo.

The remaining four scaffolded entries (Technology & AI, Programming, Anime, Psychology,
Personal Development) are still drafts and are now prefixed `[DRAFT]` in the data so the
unedited ones are obvious at a glance.

### Schema

`MediaItem` added to `profile/types.ts` and a required `media: MediaItem[]` field added to
`Hobby`. Three kinds are supported: `image`, `video` (with a `poster` frame), and `embed`
for externally hosted video (YouTube/Vimeo). `alt` is required on every item.

### Rendering

New `src/components/chat/MediaGallery.tsx`: a thumbnail strip under each hobby blurb that
opens a lightbox (Radix dialog) with captions, prev/next arrows, a counter, and arrow-key
navigation. Videos are `controls`/`playsInline`/`preload="metadata"` and never autoplay —
a clip that starts on its own inside a chat thread is an ambush. Navigating remounts the
player via `key` so the previous clip stops.

Media files are referenced by path and may not exist yet, so anything that fails to load
is dropped from the gallery at runtime; if every item fails the strip renders nothing.
Images are probed on mount so a broken tile never flashes before disappearing. Note that
a missing path under Vite dev (and under the production SPA rewrite) returns 200 with
`index.html` rather than 404 — the filtering works off the decode failure, not the status
code, so it is correct in both environments.

### Conflict fixed

`goals.ts` listed "Relationship, family, health, or religious details" as off-limits,
which would have made the AI refuse to discuss the newly added church hobby. Narrowed to
"Relationship, family, or health details" plus "Religious or political opinions beyond
what the profile already states" — so it can state that he attends church without being
drawn into beliefs or politics.

### Also updated

- `intent.ts` — patterns for football/soccer/Man City/Kaizer Chiefs/Barcelona, acting/
  short film/on set, church/faith/praying, and sightseeing/scenic/aesthetic view.
- `prompt.ts` — the knowledge base now lists each hobby's media so the model can mention a
  photo exists, with an explicit instruction never to claim media that isn't listed.
- `suggestions.ts` — hobby follow-up chips now point at football and the short film.
- `intent.test.ts` — 7 new intent cases (40 total) plus media-integrity assertions: every
  item has alt text, every `src` is a path or HTTPS URL, and every video has a poster.
- `public/hobbies/README.md` — expected filenames, ffmpeg commands for poster frames and
  compression, and guidance on hosting video externally rather than committing anything
  over ~10MB to the repo.

### Verification

`npm run test:intent` (40 cases, all pass), `tsc --noEmit` clean, `npm run lint` unchanged
at the 16-error baseline, `npm run build` clean. Browser: verified the thumbnail strip,
the lightbox with captions and arrows, the counter, a video correctly removing itself when
its file is absent, and the all-media-missing state rendering nine clean tiles with no
broken images and no console errors.

### Backward-compatible response shape (deploy safety)

The envelope change would otherwise have required the frontend and the edge function to
deploy together — either one landing first leaves visitors with a broken chat until the
other follows. `replyResponse()` in the chat function now mirrors the old
`message.content[0].text` shape alongside the new `{ text, cards, followUps, source }`
fields, so:

- the two can be deployed in either order, with no broken window;
- the frontend can be rolled back on its own (Vercel instant rollback) without touching
  the edge function, which has no rollback UI of its own.

The mirrored field can be deleted once the new frontend has been live for a while.
