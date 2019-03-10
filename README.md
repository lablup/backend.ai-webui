# backend.ai-console

Backend.AI GUI console. Supports both app / web mode.

 * Administration mode
 * User mode

## Features
 * Key management
    * Allocate resource limitation for keys
 * Session management
    * Set default resources for runs
 * Experiments
 * Virtual Folder management
    * Upload  / download files
 * Kernel managements
 * Manager settings
 * Proxy mode to support various app environments (with node.js (web), electron (app) )
	* backend.ai-wsproxy package

## Develop and Test

### Running polymer-based web UI

```
$ npm install
$ npm run polymer
$ npm run wsproxy
```
If you need to serve with nginx, please install backend.ai-wsproxy.

#### nginx configuration example


### Running websocket with node.js

This is only needed with pure ES6 dev. environment / browser. With `Electron`, websocket proxy automatically starts.

```
$ cd src/wsproxy
$ node ./local_proxy.js
```

### Running stand-alone web service

Will be prepared soon.

## Build (Web)

Default setup will build `es6-bundled` version.

```
$ polymer build
```

## Build (Electron App)

### Using makefile

Prerequistics : electron, electron-packager

```
$ make all (build win64/macos/linux app)
```

### Manual run (using local Electron)

Hard way:
```
$ polymer build
$ cd build/unbundled
$ npm install --only=prod
$ cd ../..
$ npm start
```

OR,

Easy way:

```
$ make test
$ electron .
```


## Package

```
$ make clean
$ make all
$ make pack # To create an zip-packed files (works on macOS)
```

## Serve (Web)

```
$ make dep
$ make web
```
