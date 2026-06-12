# CLAUDE.md — Who wants to be a milLEOnaire?

## Project Overview

A local, single-player-vs-the-clock quiz game built for **live presentation** on a MacBook Pro connected to a projector/beamer. The aesthetic is inspired by *Who Wants to Be a Millionaire* — polished, professional, and readable at scale. The host controls everything via keyboard shortcuts.

The game is titled **"Who wants to be a milLEOnaire?"** and is personalised for a player named **Lucas**.

## Tech Stack

- **Framework:** Vite + React (local development, no backend)
- **Styling:** Inline styles only — no CSS files
- **Question authoring:** Markdown files with YAML frontmatter
- **Asset loading:** `import.meta.glob` (Vite build-time, eager)
- **Animation:** `requestAnimationFrame` loop at 60fps with delta-time accumulation
- **Media:** Static assets in `public/media/` referenced by absolute path; YouTube embeds auto-detected by URL pattern

## Project Structure

```
gameshow/
  index.html                   # <title> and global body styles
  src/
    App.jsx                    # Screen router
    constants.js               # DIFF_POINTS, MD_EXAMPLE
    hooks/
      useGameState.js          # All game state and logic
    screens/
      SetupScreen.jsx          # Question list preview + start button
      GameScreen.jsx           # Main game screen (largest file)
      ResultScreen.jsx         # Score pot + bonus prompt
      BonusScreen.jsx          # Bonus question screen
      FinalScreen.jsx          # Final reveal screen
    components/
      OptionBtn.jsx            # Answer option button
    utils/
      parseMarkdown.js         # Parses .md question files
    questions/
      *.md                     # One file per question
      bonus.md                 # Bonus question (special file)
public/
  media/
    images/                    # Image assets (final.jpg lives here)
    videos/                    # Video assets
```

## Screen Flow

```
setup → game → result → [bonus →] result → final
```

- **setup** — Lists loaded questions, player name input, start button.
- **game** — Main quiz screen.
- **result** — Shows score pot. If score < max AND bonus not yet attempted → shows bonus prompt. Space advances to `bonus` or `final`.
- **bonus** — One bonus question that fills the pot to max if answered correctly. On complete → back to `result`.
- **final** — Title + "A Wonderful wife!" text + `/media/images/final.jpg`.

## Question File Format

Files in `src/questions/` are loaded automatically. `bonus.md` is filtered out of the main list and loaded separately.

```markdown
---
timer: 20                        # seconds (default: 20)
difficulty: 1                    # 1–5 (default: 1); UI hidden but affects points
image: /media/images/example.jpg # optional question image
video: /media/videos/clip.mp4    # optional question video (or YouTube URL)
answer_image: /media/images/ans.jpg  # optional — shown after answer reveal
answer_video: /media/videos/ans.mp4  # optional — autoplays after reveal
---

# What is the question text?

A) First option
B) Second option
C) Third option
D) Fourth option

correct: B
```

**Rich text in question body:** `**bold**` renders gold + heavy weight; `*italic*` renders italic.

Images and videos use `objectFit: contain` with a black background (letterbox/pillarbox for vertical media). Video controls are hidden.

## Scoring

Difficulty labels and badges are **hidden from the UI** but still control point values:

| Difficulty | Points    |
|------------|-----------|
| 1          | 100,000   |
| 2          | 250,000   |
| 3          | 500,000   |
| 4          | 1,000,000 |
| 5          | 2,000,000 |

With 10 questions all at difficulty 1, the **total pot = 1,000,000 points**.

Using a lifeline **halves the score** for that question.

## Phase Machine (Game Screen)

```
prereveal → revealing → playing → [timeout] → selected → revealed
```

- **`prereveal`** — Only for video questions. Space plays the video; Space again moves to `revealing`.
- **`revealing`** — Answers hidden; Space reveals one at a time, then starts the timer.
- **`playing`** — Timer running; A/B/C/D selects an answer.
- **`timeout`** — Timer hit zero without a reveal.
- **`selected`** — Answer chosen (timer still running until reveal).
- **`revealed`** — Enter pressed; correct answer shown; advance with Enter / button.

> Timer does **not** stop on answer selection — only on reveal.

## Keyboard Shortcuts (Host Controls)

| Key       | Action                                                      |
|-----------|-------------------------------------------------------------|
| `Space`   | `prereveal`: play/stop video → `revealing`: reveal option / start timer |
| `A/B/C/D` | Select answer option                                        |
| `Enter`   | Reveal answer → advance to next question / screen           |
| `Space`   | On Result screen: go to bonus or final                      |

## UI Layout (GameScreen)

The page is a dark blue radial-gradient (`#0d1b3e → #050514`).

**Header (CSS grid `1fr auto 1fr`):**
- Left: "SPELER" label + player name
- Centre: "Who wants to be a milLEOnaire?" gradient title
- Right: "VRAAG" label + question counter (right-aligned)

**Middle section (flex row):**

```
[ Lifelines 180px ] [ Question card flex:1 ] [ Score pot 180px ]
[ Left spacer 180px ] [ Answers + Controls flex:1 ] [ Right spacer 180px ]
```

- Lifelines and score are in the **same row as the question card** only (not the answers).
- The score pot **stretches to the full height of the question card** via `alignItems: 'stretch'`.
- The score pot right-aligns with the question counter header via `alignItems: 'flex-end'`.

**Score Pot (right sidebar):**
- Vertical bar filling with gold gradient as score increases
- Coin emoji 🪙 at top, score number at bottom
- Uses `flex: 1` height to fill the question card row

**Timer Bar:**
- `position: fixed`, bottom 0, 52px tall
- Smooth 60fps animation with colour lerp: blue → amber → red
- Refills smoothly on question transition (~350ms)

## Lifelines

Three lifelines, each halving the question score when used:

| Label       | State key | Behaviour                          |
|-------------|-----------|-----------------------------------|
| `50 : 50`   | `fifty`   | Eliminates 2 wrong answers        |
| `📞 Friend` | `phone`   | Pauses timer, shows overlay       |
| `📞 Family` | `family`  | Pauses timer, shows overlay       |

UI labels: "HULPLIJNEN" heading, buttons styled with blue border.

## Animations & Transitions

- **Slide transition between questions:** center column slides out left (`ease-in`, 350ms), new question slides in from right (`ease-out`, 350ms).
- **Answer media crossfade:** overlay fades to black (500ms) → media swaps → fades from black (500ms).
- **Timer refill:** smooth fill animation (~350ms) when transitioning to new question.

## Language (Dutch labels)

| English   | Dutch       |
|-----------|-------------|
| Player    | Speler      |
| Question  | Vraag       |
| Lifelines | Hulplijnen  |
| Reveal Answer | Antwoord tonen |
| Next      | Verder      |
| Score     | Score       |

## Development Notes

- All styling is **inline styles** — no CSS files, no Tailwind.
- `body { overflow: hidden }` prevents scrollbar from appearing during gameplay.
- Default player name: `"Lucas"` (in `useGameState.js`).
- Default timer: **20 seconds** (configurable per question via `timer:` frontmatter).
- `bonus.md` is excluded from the main question list; it is loaded separately by `loadBonusQuestion()`.
- The `bonusAttempted` flag prevents the bonus screen from looping.
- App runs entirely locally — no server, no auth, no network calls needed.
