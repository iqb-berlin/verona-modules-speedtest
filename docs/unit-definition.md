# Unit definition format

The unit definition is the contract between editor and player. The editor produces it, the host application (IQB-Studio / Testcenter) stores it as a string, and the player consumes it.

The authoritative source is [`projects/common/interfaces/unit.ts`](../projects/common/interfaces/unit.ts). Version history is in [changelog-unit-def.md](changelog-unit-def.md).

Current version: **2.3.0** (`package.json` → `config.unit_definition_version`).

## Structure

```jsonc
{
  "type": "speedtest-unit-definition",  // literal; units before 2.2.0 spell it "speedtest-unit-defintion"
  "version": "2.3.0",
  "layout": "column",                   // "column" = question above answers, "row" = side by side
  "questionType": "text",
  "answerType": "text",
  "multipleSelection": false,           // optional
  "instructionText": "…",               // optional, shown above every question
  "buttonColor": "#aabbcc",             // optional, answer button background
  "questionSpaceRatio": 50,             // optional, % of screen given to the question area
  "questions": [ … ]
}
```

`questionType`, `answerType` and all styling properties are **global** — they apply to every question in the unit. This is the central design decision of the module: all tasks in a unit have the same structure.

### Question

```jsonc
{
  "text": "…",             // optional for image/audio questions
  "src": "data:…",         // base64 data URL, image or audio depending on questionType
  "correctAnswer": 1,      // see below; optional — without it no code/score is reported
  "answerPosition": 2,     // only for questionType "inline-answers": word index to insert at
  "answers": [
    { "text": "richtig", "src": "data:…", "splitPosition": 3 }
  ]
}
```

`correctAnswer` is:

| case | type | meaning |
|---|---|---|
| single choice | `number` | index of the correct answer |
| `multipleSelection` | `number[]` | indices of the correct answers |
| `word-select` | `number[]` | indices of the words to select |
| `answerType: "number"` | `number` | the expected number — **its digit count also determines how many input boxes are shown** |

`splitPosition` splits a text answer label at that character index and colors the two halves (blue / red) — used for word-part tasks.

For `answerType: "number"` the `answers` array is stripped on save (`unit.service.ts:stringifyUnit`).

## Validation on load

Both modules read a unit through `parseUnitDefinition` ([`projects/common/services/unit-validation.ts`](../projects/common/services/unit-validation.ts)), which rejects a definition that is not valid JSON, does not carry a speedtest `type`, has no `version`, or whose version major differs from the module's own. The editor shows the reason in a snackbar; the player shows an error screen instead of the unit.

This is a diagnostic, not the contract: under Verona the host is responsible for pairing a unit with a module that can read it, and neither module declares `supportedUnitDefinitionTypes` in its Verona metadata.

The validator also contains the only code that knows about older forms of the format: the pre-2.2.0 spelling of `type`, which it rewrites to the canonical one, and the pre-2.3.0 `buttonWidth`, which it drops. Either way a unit adopts the current form the next time it is saved. That block is marked for deletion at the next major version.

## Type combinations

`questionType`:

| value | meaning |
|---|---|
| `text` | plain text stimulus |
| `image` | image stimulus with optional caption |
| `audio` | large play button plus optional text |
| `word-select` | sentence whose words are individually selectable; no separate answer area |
| `inline-answers` | sentence with answer buttons inserted at `answerPosition`; no separate answer area |

`answerType` (ignored for `word-select` and `inline-answers`, which the editor disables):

| value | meaning |
|---|---|
| `text` | answer buttons |
| `image` | clickable images |
| `audio` | play button plus a text button per answer |
| `number` | digit keypad writing into result boxes |

`multipleSelection` is unavailable for `number`, `word-select` and `inline-answers`. When multiple answers are possible (`multipleSelection`, `number`, `word-select`), the player shows a "next" button instead of advancing on the first click.

## CSV import

The editor can fill `questions` from a semicolon-separated CSV ([`csv-parser.ts`](../projects/editor/src/app/services/csv-parser.ts)). Text only — images and audio cannot be imported. The selected `questionType` / `answerType` / `multipleSelection` decide how the columns are interpreted, so set them **before** importing.

Columns are identified by the header row; order does not matter. Any other header is rejected.

| header | meaning |
|---|---|
| `frage` | question text |
| `loesung` | correct answer. Comma-separated list for multi-select and `word-select` |
| `antwort_<n>` | answer label |
| `teilungsposition_<n>` | `splitPosition` for `antwort_<n>` |
| `antwortpositionsindex` | `answerPosition`, only read for `inline-answers` |

The file must be UTF-8; the parser rejects anything containing a replacement character and normalises Windows line endings.

## Result data

The player sends a `vopStateChangedNotification` after every answer ([`app.component.ts:createResponseData`](../projects/player/src/app/app.component.ts)). `dataParts` contains, JSON-stringified:

- `question_<n>` — `value` (the answer, with `code`/`score` 1 or 0 if `correctAnswer` was set) and `time` (ms spent on that question). Both carry `subform: "<n>"`.
- `sums` — `total_correct` and `total_wrong` across the unit.
- `activeQuestionIndex` — the last answered index, used to resume the unit on reload.

The matching `VariableInfo` list the editor declares to the host is in `unit.service.ts:getVariableInfo`.
