Drop your profile photo here as `siba.jpg` and it will appear on the ProfileCard
in the chat (shown when someone asks "Who is Siba?").

- Filename: `siba.jpg` — or change `avatar` in
  `supabase/functions/_shared/profile/identity.ts` to match a different name.
- Recommended: square, at least 400x400, under ~200KB.

Until the file exists the card falls back to the existing hero portrait, so
nothing breaks in the meantime.
