# backend.ai-console

Backend.AI GUI console.

 * Provides administration / user mode
 * Serve both app and web.
 * Mobile-ready (preparing now)

## Features
 * Key management
    * Allocate resource limitation for keys
 * Session management
    * Set default resources for runs
    * Choose and run environment-supported apps
 * Experiments
    * Manages container stream
 * Virtual Folder management
    * Create / delete folders
    * Upload  / download files
    * Share folders (coming soon)
 * Statistics
 * Kernel managements
    * List supported kernels
	* Add kernels
	* Refresh kernel list
	* Categorize repository
	* Add/update resource templates (under development)
 * Manager settings
    * Add repository
	* Plugin support
 * Proxy mode to support various app environments (with node.js (web), electron (app) )
	* Needs backend.ai-wsproxy package

## Develop and Test

### Running polymer-based web UI

```
$ npm i --dev
$ make test_web 
$ make proxy
```
OR

```
$ npm i
$ npm run polymer
$ npm run wsproxy
```

If you need to serve with nginx, please install backend.ai-wsproxy for websocket proxy.

### nginx configuration example

#### Web server setting

```
server {
    listen      443 ssl http2;
    listen [::]:443 ssl http2;
    server_name [SERVER URL];
    charset     utf-8;

    client_max_body_size 15M;   # maximum upload size.

    root [APP PATH];
    index index.html;

    location / {
        try_files $uri /index.html;
    }
    keepalive_timeout 120;

    ssl_certificate [CERTIFICATE FILE PATH];
    ssl_certificate_key [CERTIFICATE KEY FILE PATH];
}
```

### Running websocket with node.js

This is only needed with pure ES6 dev. environment / browser. With `Electron`, websocket proxy automatically starts.

```
$ cd src/wsproxy
$ node ./local_proxy.js
```

### Running stand-alone web service

## Build

```
$ make compile
```
## Build (Web)

Default setup will build `es6-bundled` version.

```
$ make web site=[SITE CONFIG FILE POSTFIX]
```

Example:

```
$ make web site=beta
```

## Build (Electron App)

### Using makefile

Prerequistics : electron, electron-packager

```
$ make all (build win64/macos/linux app)
	OR
$ make win
$ make mac
$ make linux
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
$ make web site=(config. name)
```
