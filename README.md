# backend.ai-console

[![GitHub version](https://badge.fury.io/gh/lablup%2Fbackend.ai-console.svg)](https://badge.fury.io/gh/lablup%2Fbackend.ai-console)

Make AI Accessible: Backend.AI GUI console (web/app) for End-user / DevOps / SysAdmin.

For more information, see [manual](https://console.docs.backend.ai/en/latest/).

## Changelog

View [changelog](https://github.com/lablup/backend.ai-console/blob/main/CHANGELOG.md)

## Role

Backend.AI console focuses to

 * Serve as desktop app (windows, macOS and Linux) and web service
 * Provide both basic administration and user mode
    * Use CLI for detailed administration features such as domain administation
 * Versatile devices ready such as mobile, tablet and desktop.
 * Built-in websocket proxy feature for apps

## User Features
 * Session management
    * Set default resources for runs
    * Choose and run environment-supported apps
    * Web-based Terminal for each session
    * Fully-featured VSCode editor and environments
 * Pipeline
    * Experiments (with SACRED / MLFlow)
    * AutoML (with Microsoft NNI / MLFlow)
    * Manages container streams with pipeline vfolders
    * Storage proxy for fast data I/O between backend.ai cluster and user
    * Checks queue and scheduled jobs
 * Storage management
    * Create / delete folders
    * Upload  / download files (with upload progress)
    * Integrated SSH/SFTP server (app mode only)
    * Share folders with friends / groups
 * Statistics
    * User resource statistics
    * Session statistics
    * Workload statistics
    * Per-node statistics
    * Insight (working)
 * Configurations
    * User-specific web / app configurations
    * Beta features
    * Console logs / errors
 * License
    * Check current license information (for enterprise only)

## Management Features

 * Kernel managements
    * List supported kernels
     * Add kernel
     * Refresh kernel list
     * Categorize repository
     * Add/update resource templates
     * Add/remove docker registries
 * User management
    * User creation / deletion / key management / resource templates
 * Keypair management
    * Allocate resource limitation for keys
    * Add / remove resource policies for keys
 * Manager settings
    * Add /setting repository
    * Plugin support
 * Proxy mode to support various app environments (with node.js (web), electron (app) )
    * Needs backend.ai-wsproxy package
 * Service information
    * Component compatibility
    * Security check
    * License information
 * Work with console server (github/lablup/backend.ai-console-server)
    * Delegate login to console server
    * Support userid / password login

## Setup Guide
### Baked versions
`backend.ai-console` production version is also served as `backend.ai-app` and refered by `backend.ai-console-server` as submodule. If you use `backend.ai-console-server`, you are using latest stable release of `backend.ai-console`.

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
allowSignout = false # Let users signout from service. Signup plugin is required.
allowAnonymousChangePassword = false # Enable / disable anonymous user can send change password email. Manager plugin is required.
allowProjectResourceMonitor = true # Allow users to look up its group monitor statistics
debug = false # Debug flag. Enable this flag will bypass every error messages from manager to app notification.

[wsproxy]
proxyURL = "[Proxy URL]"
proxyBaseURL = "[Base URL of websocket proxy,]"
proxyListenIP = "[Websocket proxy configuration IP.]"

[resources]
openPortToPublic = true # Show option to open app proxy port to anyone.
maxCPUCoresPerSession = 256 # Maximum CPU per session.
maxCUDADevicesPerSession = 16  # Maximum CUDA devices per session.
maxShmPerSession = 1 # Maximum shared memory per session.
maxFileUploadSize = 4294967296 # Maximum size of single file upload. Set to -1 for unlimited upload.

[server]
consoleServerURL = "[Console server website URL. App will use the site instead of local app.]"
                   # Uses websocket proxy in the app

[plugin]
# Reserved to load plugins
#login = "signup-cloud.js"
#page = "test-plugin1,test-plugin2"

```


## Branches

 * master : Development branch
 * release : Latest release branch
 * feature/[feature-branch] : Feature branch. Uses `git flow` development scheme.
 * tags/v[versions] : version tags. Each tag represents release versions.

## Development Guide

Backend.AI console is built with
 * `lit-element` as webcomponent framework
 * `npm` as package manager
 * `rollup` as bundler
 * `electron` as app shell

### Code of conduct

View [Code of conduct](https://github.com/lablup/backend.ai-console/blob/main/CODE_OF_CONDUCT.md) for community guidelines.

### Initializing

```
$ npm i
```

If this is not your first-time compilation, please clean the temporary directories with this command:

```
$ make clean
```

You must perform first-time compilation for testing. Some additional mandatory packages should be copied to proper location.

```
$ make compile_wsproxy
```

Some necessary libraries will be copied to `src/lib`. Now you are ready to test.

### Developing / testing without bundling

```
$ npm run server:d # To run dev. web server
$ npm run build:d # To watch source changes
$ npm run wsproxy # To run websocket proxy
```

### Lint Checking
```
$ npm run lint # To check lints
```

### Unit Testing

The project uses `testcafe` as testing framework.
To perform functional tests, you must run complete Backend.AI cluster before starting test.

```
$ npm run server:d # To run dev. web server
$ npm run test # Run tests (tests are located in `tests` directory)
```

### Electron (app mode) development / testing

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

e.g. You will download the `backend.ai-console-server` package.

```
$ make compile
```

#### Web server
Good for develop phase. Not recommended for production environment.

Note: This command will use console source in `build/rollup` directory. No certificate will be used therefore console server will serve as HTTP.

Copy `console-server.example.conf` in `docker_build` directory into current directory as `console-server.conf` and modify configuration files for your needs.

```
$ docker-compose build console-dev // build only
$ docker-compose up console-dev    // for testing
$ docker-compose up -d console-dev // as a daemon
```

Visit `http://127.0.0.1:8080` to test console server.

#### Web server with SSL
Recommended for production.

Note: You have to enter the certificates (`chain.pem` and `priv.pem`) into `certificates` directory. Otherwise, you will have an error during container initialization.

Copy `console-server.example.ssl.conf` in `docker_build` directory into current directory as `console-server.conf` and modify configuration files for your needs.

```
$ docker-compose build console  // build only
$ docker-compose up console     // for testing
$ docker-compose up -d console  // as a daemon
```

Visit `https://127.0.0.1:443` to test console server serving. Change `127.0.0.1` to your production domain.

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

### Building / serving with console-server

If you need to serve as console-server (ID/password support) without compiling anything, you can use pre-built code through console-server submodule.

To download and deploy console from pre-built source, do the following in `backend.ai-console-server` repository:

```console
git submodule init
git submodule update
cd src/ai/backend/console/static
git checkout master
git fetch
git pull
```


### Running websocket proxy with node.js

This is only needed with pure ES6 dev. environment / browser. Websocket proxy is embedded in Electron and automatically starts.

```
$ npm run wsproxy
```

If console app is behind an external http proxy, and you have to pass through
it to connect to a console-server or manager server, you can set
`EXT_HTTP_PROXY` environment variable with the address of the http proxy.
Local websocket proxy then communicates with the final destination via the http
proxy. The address should include the protocol, host, and/or port (if exists).
For example,

```console
export EXT_HTTP_PROXY=http://10.20.30.40:3128 (Linux)
set EXT_HTTP_PROXY=http://10.20.30.40:3128 (Windows)
```

Even if you are using Electron embedded websocket proxy, you have to set the
environment variable manually to pass through a http proxy.


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
Note: On macOS Catalina, use scripts/build-windows-app.sh to build Windows 32bitpackage. From macOS 10.15+, wine 32x is not supported.
Note: Now the `make win` command support only Windows x64 app, therefore you do not need to use `build-windows-app.sh` anymore.

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

Note: Requires electron-installer-dmg to make macOS disk image. It requires Python 2+ to build binary for package.

```
$ make pack
```

### Manual run to test Electron

Note: There are two Electron configuration files, `main.js` and `main.electron-packager.js`. Local Electron run uses `main.js`, not `main.electron-packager.js` that is used for real Electron app.

```
$ make dep # Compile with app dependencies
$ npm run electron:d  # OR, ./node_modules/electron/cli.js .
```

### Localization
Locale resources are JSON files located in `resources/i18n`.

#### Extracting i18n resources

Run
```
make i18n
```
to update / extract i18n resources.

### Adding i18n strings

 * Use `_t` as i18n resource handler on lit-element templates.
 * Use `_tr` as i18n resource handler if i18n resource has HTML code inside.
 * Use `_text` as i18n resource handler on lit-element Javascript code.

#### Example

In lit-html template:
```
<div>${_t('general.helloworld')}</div>
```

In i18n resource (en.json):
```
{
   'general':{
      'helloworld': 'Hello World'
   }
}
```
#### Adding new language

 1. Copy `en.json` to target language. (e.g. `ko.json`)
 2. Add language identifier to `supportLanguageCodes` in `backend-ai-console.ts`.
e.g.
```javascript
  @property({type: Array}) supportLanguageCodes = ["en", "ko"];
```
 3. Add language information to `supportLanguages` in `backend-ai-usersettings-general-list.ts`.

Note: DO NOT DELETE 'default' language. It is used for browser language.

```javascript
  @property({type: Array}) supportLanguages = [
    {name: _text("language.Browser"), code: "default"},
    {name: _text("language.English"), code: "en"},
    {name: _text("language.Korean"), code: "ko"}
  ];
```
