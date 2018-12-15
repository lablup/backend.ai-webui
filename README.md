# backend.ai-admin-console

Web-based Backend.AI GUI console.

 * Administration
 * User mode

## Features
 * Key management
 * Session management
 * Experiments
 
## Develop and Test

```
$ npm install -g polymer-cli
$ npm install
$ polymer serve --npm
```

## Build (Web)

Default setup will build `es6-unbundled`.

```
$ polymer build
```

## Build (Electron App)

### Using makefile

Prerequistics : electron, electron-packager

```
$ make mac
$ make win (not yet working)
$ make linux (not yet working)
```

### Manual run (using local Electron)

```
$ polymer build
$ cd build/es6-unbundled
$ npm install --only=prod
$ cd ../..
$ npm start
```
