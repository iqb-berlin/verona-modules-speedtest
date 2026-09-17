# Player layout

Read this before changing `projects/player/src/app/unit-view.component.scss`.

The player runs on iPads in a fixed, full-screen iframe. Nothing scrolls: everything has to fit the viewport exactly, for every combination of question type, answer type and orientation. The stylesheet is therefore a dense set of percentage heights and widths rather than a flow layout, and the rules are keyed on CSS classes that stand for those combinations.

## How the classes are assigned

`setInnerWrapperClasses` in [`unit-view.component.ts`](../projects/player/src/app/unit-view.component.ts) puts these on `.inner-wrapper`:

| class | set when |
|---|---|
| `column` / `row` | `layout` |
| `instruction-present` | `instructionText` is set |
| `text-audio-only` | text question with a text or audio answer, **or** any audio question |
| `image-answers` | `answerType: "image"` |
| `numbers` | `answerType: "number"` |
| `image-and-numbers` | image question with a number answer |
| `inline-answers` | `questionType: "inline-answers"` |
| `word-select` | `questionType: "word-select"` |

Separately, the template puts `numbers-row` on `.outer-wrapper` for a number answer in `row` layout.

Note that these overlap deliberately — an image question with number answers matches `numbers`, `image-and-numbers` and `column` at once, and the heights are refined in that order. This is why a change to a broad selector such as `.column .question` reaches far more format combinations than it looks like it does.

## What to check after a change

There is no automated coverage of any of this. A layout change needs a manual pass over:

- question type: text, image, audio, word-select, inline-answers
- answer type: text, image, audio, number
- `layout`: column and row
- with and without `instructionText`
- images both larger and smaller than the space reserved for them

The `example/` folder holds units for most of these combinations (untracked — local only).

## Known traps

**`margin: auto` is broken on iPad Safari here.** It re-applies on every DOM update, so the margin grows with each digit the test taker enters. This is what the commented-out `numbers-row` rules in the stylesheet are about: they were disabled rather than deleted because the centring they provided is still wanted, just not by that mechanism. Replacing them needs something that does not recompute per update — `justify-content`, or flex spacers.

**Percentage margins resolve against width, not height.** `margin-top: 3%` on `.number-buttons` is 3% of the containing block's *inline* size, so on a landscape iPad it is far larger than it reads. Prefer fixed pixel values for vertical spacing.

**`&.audio` is dead.** `.column &.audio .question` and `.column &.audio .answers` in the stylesheet match nothing: no `audio` class is ever set on `.inner-wrapper` — an audio question gets `text-audio-only` instead. The rules happen to duplicate the neighbouring `text-audio-only` values, so removing them changes nothing, but do not reach for `.audio` expecting it to work.

**Component styles must stay under 8 kB** (`anyComponentStyle` budget in `angular.json`) or the production build fails.
