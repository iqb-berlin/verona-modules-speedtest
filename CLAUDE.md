# CLAUDE.md

Everything is in the normal documentation — read the relevant one before working in that area:

- [README.md](README.md) — what the modules are, how to run, build, test and lint them.
- [docs/releasing.md](docs/releasing.md) — versions live in `package.json` `config`, and every release is tagged.
- [docs/unit-definition.md](docs/unit-definition.md) — the editor↔player format and the result data.
- [docs/player-layout.md](docs/player-layout.md) — **read before touching `unit-view.component.scss`.** It is keyed on combinations of `layout` × `questionType` × `answerType`, nothing scrolls, and there is no automated coverage, so one rule change routinely breaks a different format combination.
