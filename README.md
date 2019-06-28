# backend.ai-console

Make AI Accessible: Backend.AI GUI console (web/app) for End-user / SysAdmin.

Backend.AI console focuses to 

 * Provide both administration and user mode
 * Serve as app and web service
 * Versatile devices ready such as mobile, tablet and desktop.
 * Built-in proxy app

## User Features
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
    * User resource statistics
    * Session statistics

## Management Features
 * Keypair management
    * Allocate resource limitation for keys
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
 * Work with console server
    * Delegate login to console server
    * Support userid / password login

## Setup Guide
### Configuration

Backend.AI Console uses `config.ini` located in app root directory. You can prepare many `config.ini.[POSTFIX]` in `configs` directory to switch various configurations.

These are options in `config.ini`.

```
[general]
apiEndpoint = [Default API Endpoint. If blank, user input field will be shown.]
apiEndpointText = [Placeholder text instead of API endpoint input field.]
defaultSessionEnvironment = [Default session kernel. If blank, alphabetically first kernel will be default.]
siteDescription = [Site description placeholder. It will be at the bottom of 'Backend.AI' at the top left corner.]
connectionMode = [Connection mode. Default is API. Currenly supports API and SESSION]
[wsproxy]
proxyURL = [Proxy URL]
proxyBaseURL = [Base URL of websocket proxy,]
proxyListenIP = [Websocket proxy configuration IP.]
```

## Development Guide

Backend.AI console is built with  
 * `litelement` / `Polymer 3 `as webcomponent framework
 * `yarn` as package manager
 * `polymer-cli` as bundler
 * `electron` as app shell

### Initializing

```
$ yarn install
```

### Developing / testing without bundling

```
$ yarn run polymer # To run web server
$ yarn run wsproxy # To run websocket proxy
```

### Electron testing

Terminal 1:
```
$ make test_web # To run test server
```
Terminal 2:
```
$ make test_electron # Run Electron as dev mode.
```

## Serving Guide

### Preparing bundled source

```
$ make compile
```

Then bundled resource will be prepared in `build/bundle`. Basically, both app and web serving is based on static serving sources in the directory. However, to work as single page application, URL request fallback is needed.

### Serving with nginx

If you need to serve with nginx, please install and setup `backend.ai-wsproxy` package for websocket proxy. Bundled websocket proxy is simplified version for single-user app.

This is nginx server configuration example. [APP PATH] should be changed to your source path.

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

### Building docker image

```
$ make compile
$ docker build -t backendai-console .
```

### Running websocket proxy with node.js

This is only needed with pure ES6 dev. environment / browser. With `Electron`, websocket proxy automatically starts.

```
$ make compile
$ npm run wsproxy
```

## Build web server with specific configuration

You can prepare site-specific configuration as `ini` format. Also, you can build site-specific web bundle refering in `configs` directory.

Note: Default setup will build `es6-bundled` version. If you want to use `es6-unbundled`, make sure that your webserver supports HTTP/2 and setup as HTTPS with proper certification.

```
$ make web site=[SITE CONFIG FILE POSTFIX]
```

Example:

```
$ make web site=beta
```

You can manually modify config.ini for your need.

## App Building Guide
### Building Electron App

Electron building is automated using `Makefile`.

```
$ make all # build win64/macos/linux app
```

#### Windows x86-64 version

```
$ make win
```

#### macOS version

```
$ make mac
```

#### Linux x86-64 version

```
$ make linux
```

### Packaging as zip files
Note: this command only works on macOS, because packaging uses `ditto`, that supports both PKZIP and compressed CPIO format.

```
$ make pack
```

### Manual run to test Electron

Note: There are two Electron configuration files, `main.js` and `main.electron-packager.js`. Local Electron run uses `main.js`, not `main.electron-packager.js` that is used for real Electron app.

```
$ make dep # Compile with app dependencies
$ electron . 
```
