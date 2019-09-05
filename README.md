# backend.ai-console

Make AI Accessible: Backend.AI GUI console (web/app) for End-user / SysAdmin.

Backend.AI console focuses to 

 * Provide both administration and user mode
 * Serve as app and web service
 * Versatile devices ready such as mobile, tablet and desktop.
 * Built-in websocket proxy app for apps

## User Features
 * Session management
    * Set default resources for runs
    * Choose and run environment-supported apps
 * Experiments
    * Manages container stream
 * Virtual Folder management
    * Create / delete folders
    * Upload  / download files
    * Share folders 
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
 * User management
    * User creation / deletion
 * Manager settings
    * Add repository
    * Plugin support
 * Proxy mode to support various app environments (with node.js (web), electron (app) )
    * Needs backend.ai-wsproxy package
 * Work with console server (github/lablup/backend.ai-console-server)
    * Delegate login to console server
    * Support userid / password login

## Setup Guide
### Configuration

Backend.AI Console uses `config.toml` located in app root directory. You can prepare many `config.toml.[POSTFIX]` in `configs` directory to switch various configurations.

These are options in `config.toml`.

```
[general]
apiEndpoint = "[Default API Endpoint. If blank, user input field will be shown.]"
apiEndpointText = "[Placeholder text instead of API endpoint input field.]"
defaultSessionEnvironment = "[Default session kernel. If blank, alphabetically first kernel will be default.]"
siteDescription = "[Site description placeholder. It will be at the bottom of 'Backend.AI' at the top left corner.]"
connectionMode = "[Connection mode. Default is API. Currenly supports API and SESSION]"
allowChangeSigninMode = false # Allows user to change signin mode between `API` and `SESSION`
signupSupport = false # Enable / disable signup feature support. Manager plugin is required.
debug = false # Debug flag. Enable this flag will bypass every error messages from manager to app notification.

[wsproxy]
proxyURL = "[Proxy URL]"
proxyBaseURL = "[Base URL of websocket proxy,]"
proxyListenIP = "[Websocket proxy configuration IP.]"

[server]
consoleServerURL = "[Console server website URL. App will use the site instead of local app.]"
                   # Uses websocket proxy in the app

```

## Development Guide

Backend.AI console is built with  
 * `litelement` / `Polymer 3 `as webcomponent framework
 * `npm` as package manager
 * `rollup` as bundler
 * `electron` as app shell

### Initializing

```
$ npm i
```

### Developing / testing without bundling

```
$ npm run server:d # To run dev. web server
$ npm run build:d # To watch source changes
$ npm run wsproxy # To run websocket proxy
```

### Electron testing

#### Live testing

Terminal 1:
```
$ npm run server:d # To run test server
```
OR
```
$ npm run server:p # To run compiled source
```
Terminal 2:
```
$ npm run electron:d # Run Electron as dev mode.
```

## Serving Guide

### Preparing bundled source

```
$ make compile
```

Then bundled resource will be prepared in `build/rollup`. Basically, both app and web serving is based on static serving sources in the directory. However, to work as single page application, URL request fallback is needed.

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

### Building docker image using docker-compose

Make sure that you compile the console.

```
$ make compile
```

#### HTTP server
Good for develop phase. Not recommended for production environment.

```
$ docker-compose build console // build only
$ docker-compose up console    // for testing
$ docker-compose up -d console // as a daemon
```

#### HTTPS with SSL
Recommended for production.

Note: You have to enter the certificates (`chain.pem` and `priv.pem`) into `certificates` directory. Otherwise, you will have an error during container initialization.

```
$ docker-compose build console-ssl  // build only
$ docker-compose up console-ssl     // for testing
$ docker-compose up -d console-ssl  // as a daemon
```

#### Removing

```
$ docker-compose down
```

#### Manual image build
```
$ make compile
$ docker build -t backendai-console .
```

Testing / Running example

Check your image name is `backendai-console_console` or `backendai-console_console-ssl`. Otherwise, change the image name in the script below.

```
$ docker run --name backendai-console -v $(pwd)/config.toml:/usr/share/nginx/html/config.toml -p 80:80 backendai-console_console /bin/bash -c "envsubst '$$NGINX_HOST' < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
$ docker run --name backendai-console-ssl -v $(pwd)/config.toml:/usr/share/nginx/html/config.toml -v $(pwd)/certificates:/etc/certificates -p 443:443 backendai-console_console-ssl /bin/bash -c "envsubst '$$NGINX_HOST' < /etc/nginx/conf.d/default-ssl.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
```

### Running websocket proxy with node.js

This is only needed with pure ES6 dev. environment / browser. Websocket proxy is embedded in Electron and automatically starts.

```
$ npm run wsproxy
```

## Build web server with specific configuration

You can prepare site-specific configuration as `ini` format. Also, you can build site-specific web bundle refering in `configs` directory.

Note: Default setup will build `es6-bundled` version. If you want to use `es6-unbundled`, make sure that your webserver supports HTTP/2 and setup as HTTPS with proper certification.

```
$ make web site=[SITE CONFIG FILE POSTFIX]
```
If no prefix is given, default configuration file will be used.

Example:

```
$ make web site=beta
```

You can manually modify config.toml for your need.

## App Building Guide
### Building Electron App

Electron building is automated using `Makefile`.

```
$ make clean  # clean prebuilt codes
$ make mac # build macOS app
$ make win # build win64 app
$ make linux # build linux app
$ make all # build win64/macos/linux app
```

#### Windows x86-64 version

```
$ make win
```
Note: Building Windows x86-64 on other than Windows requires Wine > 3.0

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

Note: Packaging usually performs right after app building. Therefore you do not need this option in normal condition.

```
$ make pack
```

### Manual run to test Electron

Note: There are two Electron configuration files, `main.js` and `main.electron-packager.js`. Local Electron run uses `main.js`, not `main.electron-packager.js` that is used for real Electron app.

```
$ make dep # Compile with app dependencies
$ npm run electron:d  # OR, ./node_modules/electron/cli.js . 
```
