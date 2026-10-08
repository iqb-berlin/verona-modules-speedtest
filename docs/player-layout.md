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

[`fixtures/`](../fixtures/README.md) holds a unit for every combination, with these edge cases as items, and describes how to check them.

## Known traps

**The `numbers-row` auto margins once broke on iPadOS 26.0/26.1.** [Issue #33](https://github.com/iqb-berlin/verona-modules-speedtest/issues/33) reports the image shrinking a little on every "weiter", down to a dot over many items, with `margin-top: auto` on `.inner-wrapper` and `margin-bottom: auto` on `.unit-nav-next`. 3.4.0-beta disabled the two rules as a workaround, which moves the instruction text down to the answers. In October 2026 the bug could not be reproduced on iPadOS 26.2, 26.6 or 27 (real iPad and BrowserStack, 20 items, image height measured), so the rules were restored; 26.0/26.1 could not be tested any more. The likely root cause is WebKit's sizing of percentage heights inside the `height: unset` children of `numbers-row` ([WebKit #300866](https://bugs.webkit.org/show_bug.cgi?id=300866) has similar symptoms), with the auto margins only as the trigger. If it comes back, re-disabling the two rules is the known workaround; a proper fix is a `numbers-row` layout that does not rely on percentage heights under an indefinite height.

**Percentage margins resolve against width, not height.** `margin-top: 3%` on `.number-buttons` is 3% of the containing block's *inline* size, so on a landscape iPad it is far larger than it reads. Prefer fixed pixel values for vertical spacing.

**Component styles must stay under 8 kB** (`anyComponentStyle` budget in `angular.json`) or the production build fails.
