# verona-modules-speedtest

Repository for the Speedtest Editor and Player. The applications have a shared code base (common), but can be run and built separately.

Meant to be used in [IQB-Studio](https://github.com/iqb-berlin/studio-lite) and [IQB-Testcenter](https://github.com/iqb-berlin/testcenter).

Both conform to the Verona API definition:

[Editor-API](https://verona-interfaces.github.io/editor/)

[Player-API](https://verona-interfaces.github.io/player/)

## Supported Browsers
last 1 Chrome version

last 1 Firefox version

last 2 Edge major versions

last 2 Safari major versions

last 2 iOS major versions

Firefox ESR

not IE 11


## Build & Run

To build the packages or run the local development environment, first install the NPM packages. You need to have a recent version of node and npm (tested and working with versions: 6,7,8) installed.
> npm install

### Run development server
Run the package on a local development server (this builds the app automatically).

>npm run start-editor

or

>npm run start-player

### Build
This produces an HTML file in the `dist` folder, named `iqb-{module}-speedtext-{version}.html`.
