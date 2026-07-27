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
`og:image`/`twitter:image` pointed to Lovable's own placeholder OG image, and
`twitter:site` was set to `@lovable_dev` — none of which belong to this site. Switched to
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
