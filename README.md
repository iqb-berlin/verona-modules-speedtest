# verona-modules-speedtest
Repository for the Speedtest Editor and Player. The applications have a shared code base (common), but can be run and built separately.

Meant to be used in [IQB-Studio](https://github.com/iqb-berlin/studio-lite) and [IQB-Testcenter](https://github.com/iqb-berlin/testcenter).

Both conform to the Verona API definition:

[Editor-API](https://verona-interfaces.github.io/editor/)

[Player-API](https://verona-interfaces.github.io/player/)

## Main characteristics
- All tasks within a unit have the same structure.
- No going back to a previous task.
- Timing values for every task are taken and summed up. Both are part of the result data.

## Documentation
- [Unit definition format](docs/unit-definition.md) — the contract between editor and player, including the CSV import columns and the result data the player sends.
- [Player layout](docs/player-layout.md) — how the player's CSS is keyed on question/answer type combinations, and the traps to avoid when changing it.
- [Releasing](docs/releasing.md) — where the versions live, and the steps from a version bump to an upload.
- [Changelog](docs/changelog.md) — module releases.
- [Unit definition changelog](docs/changelog-unit-def.md) — format versions.

## Build & Run
To build the packages or run the local development environment, first install the NPM packages. Angular 19 requires Node 18.19+, 20.11+ or 22.11+ (developed against Node 22).
> npm install

### Run development server
Run the package on a local development server (this builds the app automatically).

>npm run start-<editor/player>

The editor serves on port 4201, the player on 4202. Started standalone (not inside a host application) both offer a button to load a unit definition from a file.

### Build
>npm run build-<editor/player>

This produces an HTML file in the `dist` folder, named `iqb-{module}-speedtest-{version}.html`. The file is fully self-contained: `scripts/distpacker.js` inlines all JavaScript, CSS, fonts and images as base64. Upload it to IQB-Studio via `scripts/upload.sh <file>`.

The version comes from `config.player_version` / `config.editor_version` in `package.json`.

### Test
>npm test

Runs the unit tests of both projects once in headless Chromium. `npm run test-player` and `npm run test-editor` run a single project. A Chromium binary must be available; set `CHROME_BIN` if it is not found automatically.

### Lint
>npm run lint

ESLint with [`@iqb/eslint-config`](https://github.com/iqb-berlin/eslint-config); the configuration is declared inline in `package.json`.
