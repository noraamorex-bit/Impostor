<div align="center">

# 🎭 Imposter

**One phone. One secret. Someone doesn't belong.**

A mobile-first, pass-the-phone party game for 3–12 players.
No accounts, no server, no gameplay API — just a phone and a table full of suspects.

</div>

---

## What the game is

Everybody around the table gets the same secret word — everybody except the imposter.
The phone goes around, each player privately reveals their own screen and hides it again,
and then the talking starts. Describe the word without saying it. Sound confident.
Work out who is faking it, vote, and find out how wrong you were.

A round takes about three minutes. Play again takes one tap.

### Flow

```
Home → Setup → Pass → Reveal → … → Discussion → Voting → Results → Play again
```

## Game modes

| Mode | What the imposter sees | The twist |
| --- | --- | --- |
| **Classic** | "You are the imposter." Nothing else. | Pure bluffing — they have no idea what the word is. |
| **With a Clue** | "You are the imposter" + a short clue about the word. | Just enough rope to blend in, or to hang themselves. |
| **Blind Spot** | The category the word came from, e.g. 🍔 Food. | They know the shelf but not the book — plausible for one round, rarely two. |
| **Cipher** | The word with its letters hidden: `B▪▪▪▪`, 5 letters. | A first letter is a real lead and a real trap. |
| **Unknown Imposter** | A *different but related* word (Beach → Pool). | Their screen looks exactly like everyone else's. They don't know they're the imposter. |
| **Accomplices** | "You are the imposter" + the names of the other imposters. | Two or more liars who can cover for each other — or throw each other under the bus. Needs 4+ players. |

The mode system is data-driven (`lib/game/modes.ts` + a `switch` in the engine), so adding a
seventh mode means adding one entry and one branch. A mode can declare a minimum imposter count
(`minImposters`), which the setup screen and the engine both enforce, and modes removed in a
later version fall back to Classic rather than breaking a stored setup.

## Features

- **Six game modes**, from pure-bluff Classic to two-imposter Accomplices
- **1,500+ hand-written words** across 34 categories, every one with a clue for "With a Clue" mode
- **700+ curated related pairs** for Unknown Imposter mode, tagged by category and difficulty
- **3–12 players** with fully editable names (blank names fall back to `Player N`)
- **Configurable imposter count**, clamped so imposters can never overwhelm the table
- **Category selection** — all categories, or any combination of them
- **Serious pass-the-phone privacy**: a neutral hand-off screen, a deliberate tap-to-reveal,
  and a privacy curtain that wipes the card before the phone moves
- **Discussion timer** (off / 1 / 1½ / 2 / 3 / 5 minutes) with pause, reset and a suggested first speaker
- **Open or private voting** — shout it out, or pass the phone again for secret ballots
- **Dramatic results**: staged imposter reveal, the word, the clue or alternate word, full vote
  tally and the outcome (civilians win / imposter wins / split vote)
- **Instant replay** that keeps every setup choice and never repeats the last 40 words
- **Premium dark glassmorphism UI** — translucent panels lit by a stage light behind the
  content column, so the glass actually refracts something instead of sitting on flat black
- **The palette follows the game**: calm violet while the phone goes round, warm amber during the
  discussion, hot coral at the vote, and the verdict colour on the results screen
- **Sound**, synthesised in the browser with the Web Audio API — no audio files in the bundle.
  Every player's reveal cue is identical, so nothing leaks across the table
- **Quick start** from the home screen, a **redeal** if someone glimpses the wrong card, and the
  screen is held awake while a round is in progress
- **Accessible**: semantic buttons, keyboard support, visible focus rings, 44px+ touch targets,
  full `prefers-reduced-motion` support, and independent toggles for sound, haptics and wake lock
- **Private by design**: no accounts, no backend, no analytics. Round secrets never touch storage.
- **Installable**: ships a web manifest, so "Add to Home Screen" gives you a full-screen game

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, fully client-side game — no server needed)
- React 19 + TypeScript
- Tailwind CSS v4 with a hand-written glass design system (`app/globals.css`)
- [Framer Motion](https://motion.dev) for screen, reveal and result animations
- [Lucide](https://lucide.dev) icons
- [Vitest](https://vitest.dev) for the game-engine test suite

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm start          # serve the production build
npm test           # run the engine + word database test suite
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

Node 20+ is recommended.

## Deploying

The app is 100% static/client-side — no database, no API route, no environment variable to set.
It is set up to deploy to either host (or both, from the same `main`).

### Vercel

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com/new), import the repository.
3. Keep the defaults — `vercel.json` pins the framework preset and build command, so the
   project builds correctly even if it was first imported before the app existed (in which case
   Vercel would have detected no framework and served the repo as static files, giving a 404).
4. Deploy.

Any push to the default branch redeploys.

### GitHub Pages

`.github/workflows/deploy-pages.yml` typechecks, lints, tests, builds a static export and
publishes it on every push to `main`. One-time setup:

**Settings → Pages → Build and deployment → Source: _GitHub Actions_.**

Then push to `main` (or run the workflow manually from the Actions tab). The site lands at
`https://<user>.github.io/<repo>/`.

A project site is served from a sub-path, so that build sets a base path — otherwise every
CSS/JS URL would 404. It is switched on by two environment variables that only the workflow
sets, which is why the Vercel build (served from the root) is unaffected:

```bash
GITHUB_PAGES=true NEXT_PUBLIC_BASE_PATH=/Impostor npm run build   # → ./out
```

To check that export the way GitHub Pages serves it, host `out/` under the same sub-path
rather than at the root — opening `out/index.html` directly will not load its assets.

## Project structure

```
app/
  layout.tsx          # fonts, metadata, ambient background
  page.tsx            # mounts the game provider + shell
  globals.css         # the whole design system (tokens, glass, buttons, motion)
components/
  GameShell.tsx       # picks the screen for the current phase
  screens/            # home, how to play, settings
  setup/              # lobby: players, imposters, mode, categories, options
  game/               # pass, reveal, hand-off, discussion
  voting/             # vote hand-off + ballot
  results/            # reveal, tally, confetti
  ui/                 # button, glass card, stepper, toggle, word display…
lib/
  hooks/              # wake lock
lib/
  game/               # engine, reducer, modes, storage, helpers (no JSX)
  words/              # the word database, categories and related pairs
types/                # Player, Round, GameMode, Word, WordPair, Vote, GamePhase…
tests/                # engine, reducer/flow and word database tests
```

The rule the codebase follows: **`lib/game` never imports React**, and components never
compute game logic. Everything about picking words, choosing imposters, tallying votes and
deciding the winner lives in `lib/game/engine.ts` and `lib/game/reducer.ts`, which is what the
tests exercise.

## What is *not* persisted

A round in progress is deliberately **not** recoverable across a reload: restoring it would mean
writing the word and the imposters to disk, where a curious player could read them. Reloading
mid-round drops you back at the home screen with your setup (and names, if you asked for them)
intact, and the browser warns you before it happens.

## Privacy

- Round secrets — the word, the pair, who the imposters are, who voted for whom — live in
  memory only, for exactly as long as the round does.
- `localStorage` holds only setup choices, preferences and the recent-word history.
- Player names are stored **only** if you turn on *Remember player names* in Settings.
- Everything can be erased from Settings → Clear saved data.

## Testing

```bash
npm test
```

71 tests covering every game mode, 3- and 12-player games, multiple imposters, name handling,
category filtering, clue and related-word assignment, vote tallying, all three outcomes, the
complete phase flow, replay, and the guarantee that a word is never repeated while it is still
in the history.

## House rules

- Nobody says the word out loud — not even the civilians. Describe it, never define it.
- One sentence per person per turn.
- No dodging: if it's your turn, you speak.

Enjoy accusing your friends.
