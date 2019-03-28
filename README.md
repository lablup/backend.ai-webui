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
    location /proxy/ {
        proxy_pass http://127.0.0.1:5050/;
    }
    location /p10001/ {
        proxy_pass http://127.0.0.1:10001/;
    }
    keepalive_timeout 120;

    ssl_certificate [CERTIFICATE FILE PATH];
    ssl_certificate_key [CERTIFICATE KEY FILE PATH];
}
```

#### Proxy setting

```
server {
    listen      8443 ssl http2;
    listen [::]:8443 ssl http2;
    server_name [PROXY URL];
    charset     utf-8;

    client_max_body_size 15M;   # maximum upload size.

    root /home/kookmin/backend.ai-console/deploy;
    index index.html;

    location / {
        proxy_pass http://127.0.0.1:5050/;
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
$ make web site=(config. name)
```
