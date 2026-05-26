# CLAUDE.md — Game Show Quiz Application

## Project Overview

A local, single-player-vs-the-clock quiz game built for **live presentation** on a MacBook Pro connected to a projector/beamer. The aesthetic is inspired by *Who Wants to Be a Millionaire* — polished, professional, and readable at scale. The host controls everything via keyboard shortcuts.

## Tech Stack

- **Framework:** Vite + React (local development, no backend)
- **Question authoring:** Markdown files with YAML frontmatter
- **Asset loading:** `import.meta.glob` (Vite build-time)
- **Animation:** `requestAnimationFrame` loop at 60fps with delta-time accumulation
- **Media:** Static assets in `public/media/` referenced by absolute path; YouTube embeds auto-detected by URL pattern

## Project Structure

```
src/
  questions/        # One .md file per question
  components/       # React UI components
  ...
public/
  media/            # Images and video assets
CLAUDE.md
```

## Question File Format

Each question is a separate `.md` file in `src/questions/`. Questions are loaded automatically via `import.meta.glob`.

```markdown
---
timer: 30           # seconds
difficulty: 3       # 1–5 scale
image: /media/example.jpg   # optional
video: https://youtube.com/... # optional; auto-detected as YouTube embed
---

What is the question text?

A) First option
B) Second option
C) Third option
D) Fourth option

Answer: B
```

## Scoring

| Difficulty | Points |
|------------|--------|
| 1          | 100    |
| 2          | 250    |
| 3          | 500    |
| 4          | 1000   |
| 5          | 2000   |

Lifelines (50:50 and Phone a Friend) **halve the question score** when used.

## Game Flow & Phase Machine

Phases progress in this order:

```
'revealing' → 'playing' → 'timeout' → 'selected' → 'revealed'
```

- **`revealing`** — Options are hidden; host presses Space to show them and start the timer.
- **`playing`** — Timer is running; player can select and change their answer freely.
- **`timeout`** — Timer expired without a reveal; answer is locked.
- **`selected`** — An answer has been chosen; timer is still running (it only stops on reveal).
- **`revealed`** — Host pressed Enter; correct answer is shown; game advances.

> **Key rule:** The timer does **not** stop on answer selection — only on reveal (Enter).

## Keyboard Shortcuts (Host Controls)

| Key        | Action                                      |
|------------|---------------------------------------------|
| `A/B/C/D`  | Select answer option                        |
| `Space`    | Reveal options and start timer              |
| `Enter`    | Reveal correct answer and advance           |

## UI Layout

All elements are sized for beamer readability.

- **Header bar** — Score, question number, etc.
- **Question card** — Displays question text and optional media
- **2×2 Answer grid** — Four labeled options (A–D)
- **Lifeline buttons** — Fixed position, vertically centered on the left side
- **Controls bar** — Hint text and action buttons at the bottom
- **Timer bar** — Fixed to the bottom, 52px tall; shows remaining seconds

## Timer Implementation

- `requestAnimationFrame` loop accumulating delta-time for smooth 60fps animation
- Color interpolates **blue → amber → red** as time runs out
- Color computed via a `lerpColor` function returning RGB components, used to construct `rgb()` / `rgba()` CSS strings directly (not hex)

## Development Principles & Known Patterns

- **Always prefer full file rewrites** over incremental patches. Partial edits cause files to fall out of sync (duplicate closing tags, missing imports, stale prop definitions). When in doubt, rewrite the whole file.
- Questions are fully data-driven — adding a new question means adding one `.md` file, nothing else.
- The app is entirely local (no server, no auth, no network calls needed).
