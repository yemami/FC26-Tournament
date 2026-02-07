# Round Robin Tournament

Interactive React app for running a round-robin tournament: every player plays every other player once, with score entry, goals tracking, standings (points then goals), and golden-goal playoffs for ties.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL shown (e.g. http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Features

- **Setup**: Add/remove players, shuffle order, start tournament.
- **Rounds**: Round-robin schedule (circle method); works for odd or even number of players (byes when odd).
- **Scores**: Enter result (goals A – goals B) for each match; edit anytime.
- **Standings**: Points (3 win, 1 draw, 0 loss), goals for/against, goal difference; ties highlighted.
- **Tie-break**: If two players have same points and same goals for, a golden goal playoff is created; first to score wins.
- **Podium**: Top 3 shown when all matches (including golden goal) are done.
- **Persistence**: State is saved to `localStorage` so refresh keeps your data.

## Tech

- React 18, TypeScript, Vite, Tailwind CSS.
