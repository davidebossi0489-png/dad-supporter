# Parents Supporter

A mobile-friendly web app that gives parents a simple game to play with their children every day, and finds new ideas on demand. Italian and English.

- **Daily game**, chosen from the family profile (ages, place, materials, skills, time). A game never repeats within 30 days.
- **Search** by number of children, ages, place, materials, duration (5 / 10 / 15 / 20+ min) and skills to train (motor skills, problem solving, reflection, collaboration, creativity, language).
- **Invent a new game** with AI when nothing in the library fits.
- **90 hand-written games** for ages 2 to 10, each in Italian and English.
- **Cartoon animation** for every game (10 reusable CSS scene templates with color themes).
- **History and favorites**, family profile, all stored on the device (no login, no server database).
- Installable as a web app (PWA manifest).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | Required | What it does |
|---|---|---|
| `ANTHROPIC_API_KEY` | Only for "Invent a new game" | Server-side key used by `/api/generate`. Never exposed to the browser. |
| `ANTHROPIC_MODEL` | No | Overrides the model (default `claude-sonnet-5-5`). |

Copy `.env.example` to `.env.local` for local development. On Vercel, add them under Project Settings → Environment Variables. Without a key the rest of the app works and the invent button shows a friendly error.

## Deploy

1. Import the repo in Vercel (framework: Next.js, default settings).
2. Add `ANTHROPIC_API_KEY`.
3. Deploy.

## Project structure

```
app/                 Next.js app router (page, layout, styles, /api/generate)
components/          App screens, cartoon Scene kit, icons
lib/games-1..3.ts    The 90 hand-written games (30 per file)
lib/gamekit.ts       Compact constructor used by the game files
lib/pick.ts          Matching, search and the daily pick with the 30-day rule
lib/i18n.ts          Italian and English interface strings
lib/storage.ts       Local device storage
scripts/check-games.mjs  Validates the game library
archive/             The first prototype (single HTML file)
```

## Adding a game

Add an entry to one of the `lib/games-*.ts` files using `mk(...)`:

```ts
mk("g091", "hop", [4, 8], 10, [1, 4], ["living"], ["cushions"], ["motor", "problem"],
  [/* Italian: title, description, step 1, 2, 3, easier, harder */],
  [/* English: same order */]),
```

- `scene` is one of `hop, toss, crawl, stack, draw, dance, balance, hide, sort, pretend`.
- Allowed `places`, `items` and `skills` are listed in `lib/types.ts`.
- Check the library with `npm run check:games` (Node 22+).

## Notes

- Games are suggestions for play with an adult nearby. Each game page shows a safety reminder.
- The AI route validates the model output, uses household materials only, and has a basic per-instance rate limit. For a public launch, add a shared rate limit (for example Vercel KV or Upstash).
