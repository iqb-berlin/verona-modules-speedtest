# Releasing

## Where the versions live

In `package.json`, under `config`:

```json
"config": {
  "player_version": "3.4.0-beta",
  "editor_version": "3.2.0",
  "unit_definition_version": "2.1.0"
}
```

`player_version` and `editor_version` are independent; a release usually touches only one of them. `build.sh` reads the relevant one, substitutes it for `version-placeholder` in the module's Verona metadata (`index-prod.html`) and names the output file `iqb-{module}-speedtest-{version}.html`.

`unit_definition_version` versions the format itself, not a module. It is written into every unit the editor saves, and the editor **refuses to load a unit whose major version differs** from its own (`unit.service.ts:loadUnitDefinition`). So bump the major only for a genuinely breaking format change, and expect units authored with older majors to stop opening.

A version that is not considered ready for general use carries a `-beta` suffix, numbered if there is more than one (`3.2.0-beta`, `3.2.0-beta2`, `3.2.0-beta3`).

## The changelog

Entries are written as the changes are made, not at release time: every change adds its entry under the `# next` heading at the top of [changelog.md](changelog.md), in the same commit. German, grouped under `## Player` / `## Editor` and then `### Neue Funktionen` / `### Änderungen` / `### Fehlerbehebungen`. Releasing only swaps `# next` for the version number.

## Steps

1. Bump `player_version` or `editor_version` in `package.json`.
2. Rename the `# next` heading at the top of [changelog.md](changelog.md) to the version being released. If the unit definition changed, add an entry to [changelog-unit-def.md](changelog-unit-def.md) as well.
3. `npm run build-player` (or `build-editor`). This writes the packed HTML to `dist/`.
4. Commit, and tag the commit with the bare version number: `git tag 3.4.0 && git push --tags`.
5. Create a GitHub release on that tag, with the new changelog section as its notes and the built file(s) from `dist/` attached. Mark it as a pre-release if the version has a `-beta` suffix.
6. Optionally upload the built file to IQB-Studio, either through the Studio UI or with `scripts/upload.sh dist/iqb-player-speedtest-3.4.0.html`, which asks for the password or reads `IQB_STUDIO_PW` from the environment.
