# Hobby media

Drop your photos and clips in the folders below. The filenames here are the ones
already referenced in `supabase/functions/_shared/profile/hobbies.ts` — match
them and everything just appears. Anything missing is skipped silently, so a
half-filled folder never shows a broken tile.

```
football/man_city.jpeg              in the Man City shirt
acting/take1.mp4                    clip from the short film
acting/onset.jpeg                   the crew mid-scene
acting/action.jpeg                  a scene being filmed
acting/acting.jpeg                  behind the camera
sightseeing/views.mp4               the view clip
sightseeing/beach.jpeg              at the coast
faith/church.jpeg                   during the service
```

Filenames are not magic — they come from the `media` array for each hobby in
`supabase/functions/_shared/profile/hobbies.ts`. Rename a file and update it
there, or add a new entry. `npm run test:intent` checks every referenced path
actually exists under `public/`, so a typo fails the suite instead of silently
showing nothing.

## Posters

Each video wants a `poster` — a still frame used as its thumbnail. Without one
the tile is a grey box until the video loads. Grab a frame with:

```bash
ffmpeg -i acting/short-film.mp4 -ss 00:00:01 -vframes 1 acting/short-film-poster.jpg
```

## Images

Roughly 1200px on the long edge is plenty. JPEG or WebP. Keep each under ~300KB.

## Video — read this before committing a large file

Everything in `public/` is committed to git and shipped with the deployment.
That is fine for short clips and bad for anything large.

- **Under ~10MB** — put it here. Simplest thing that works.
- **Larger, or the full short film** — do not commit it. Two better options:

  1. **YouTube or Vimeo** (best for the short film — it also gets the work seen).
     Upload it, then switch that entry to an embed:

     ```ts
     { kind: "embed",
       src: "https://www.youtube.com/embed/VIDEO_ID",
       alt: "The short film Siba acted in" }
     ```

     Use the `/embed/` URL, not the `watch?v=` one.

  2. **Supabase Storage** — you already have the project. Create a public bucket,
     upload, and use the public URL as `src` with `kind: "video"`.

Trim clips to the part worth watching. A 15–30 second cut works far better in a
chat thread than three minutes.

## Compressing a clip

```bash
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset slow -vf "scale=1280:-2" -an output.mp4
```

`-an` strips audio. Drop it if the sound matters.
