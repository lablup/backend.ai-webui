# Backend.AI Web UI

[![GitHub version](https://img.shields.io/github/v/release/lablup/backend.ai-webui?color=39a96b&label=release&sort=semver&style=for-the-badge)](https://github.com/lablup/backend.ai-webui/releases/latest)
[![GitHub version](https://img.shields.io/github/v/release/lablup/backend.ai-webui?color=ff9300&include_prereleases&label=testing&sort=semver&style=for-the-badge)](https://github.com/lablup/backend.ai-webui/releases/latest)

Make AI Accessible: Backend.AI Web UI (web/app) for End-user / DevOps / SysAdmin.

For more information, see [manual](https://webui.docs.backend.ai/en/latest/).

## Changelog

View [changelog](https://github.com/lablup/backend.ai-webui/blob/main/CHANGELOG.md)

## Role

Backend.AI Web UI focuses to

- Both desktop app (Windows, macOS and Linux) and web service
- Provide both basic administration and user mode
  - Use CLI for detailed administration features such as domain administration
- Versatile devices ready such as mobile, tablet and desktop
- Built-in websocket proxy feature for desktop app

## User Features

- Session management
  - Set default resources for runs
  - Monitor current resources sessions using
  - Choose and run environment-supported apps
  - Web-based Terminal for each session
  - Fully-featured Visual Studio Code editor and environments
- Inference service management
  - Set / reserve endpoint URL for inference
  - Autoscaling setup
- Pipeline
  - Experiments (with SACRED / Microsoft NNI / Apache MLFlow)
  - AutoML (with Microsoft NNI / Apache MLFlow)
  - Manages container streams with pipeline vfolders
  - Storage proxy for fast data I/O between backend.ai cluster and user
  - Checks queue and scheduled jobs
- Storage management
  - Create / delete folders
  - Upload / download files (with upload progress)
  - Integrated SSH/SFTP server (app mode only)
  - Share folders with friends / groups
- Node management
  - See calculation nodes in Backend.AI cluster
  - Live statistics of bare-metal / VM nodes
- Statistics
  - User resource statistics
  - Session statistics
  - Workload statistics
  - Per-node statistics
  - Insight (working)
- Configurations
  - User-specific web / app configurations
  - System maintenances
  - Beta features
  - WebUI logs / errors
- License
  - Check current license information (for enterprise only)
- Plugins
  - Per-site specific plugin architecture
  - Device plugins / storage plugins
- Help & manuals
  - Online manual

## Management Features

- Kernel managements
  - List supported kernels
  - Add kernel
  - Refresh kernel list
  - Categorize repository
  - Add/update resource templates
  - Add/remove docker registries
- User management
  - User creation / deletion / key management / resource templates
- Keypair management
  - Allocate resource limitation for keys
  - Add / remove resource policies for keys
- Manager settings
  - Add /setting repository
  - Plugin support
- Proxy mode to support various app environments (with node.js (web), electron (app) )
  - Needs backend.ai-wsproxy package
- Service information
  - Component compatibility
  - Security check
  - License information
- Work with Web server (github/lablup/backend.ai-webserver)
  - Delegate login to web server
  - Support userid / password login

## Setup Guide

### Baked versions

`backend.ai-webui` production version is also served as `backend.ai-app` and refered by `backend.ai-webserver` as submodule. If you use `backend.ai-webserver`, you are using latest stable release of `backend.ai-webui`.

### Configuration

Backend.AI Web UI uses `config.toml` located in app root directory. You can prepare many `config.toml.[POSTFIX]` in `configs` directory to switch various configurations.

> NOTE: Update only `config.toml.sample` when you update configurations.
> Any files in `configs` directory are auto-created via [`Makefile`](Makefile).

These are options in `config.toml`.
You can refer the role of each key in [`config.toml.sample`](config.toml.sample)

## Debug mode

When enabling debug mode, It will show certain features used for debugging in both web and app respectively.

### Debugging in web browser

- Show raw error messages
- Enable creating session with manual image name

### Debugging in app(electron)

If you want to run the app(electron) in debugging mode, you have to first [initialize](#initializing) and [build the Electron app](#building-electron-app).

If you have initialized and built the app(electron), please run the app(electron) in debugging mode with this command:

```console
$ make test_electron
```

You can debug the app.

## Branches

- main : Development branch
- release : Latest release branch
- feature/[feature-branch] : Feature branch. Uses `git flow` development scheme.
- tags/v[versions] : version tags. Each tag represents release versions.

## Development Guide

Backend.AI Web UI is built with

- `lit-element` as webcomponent framework
- `react` as library for web UI
- `pnpm` as package manager
- `rollup` as bundler
- `electron` as app shell
- `watchman` as file change watcher for development

### Code of conduct

View [Code of conduct](https://github.com/lablup/backend.ai-webui/blob/main/CODE_OF_CONDUCT.md) for community guidelines.

### Initializing

```console
$ pnpm i
```

If this is not your first-time compilation, please clean the temporary directories with this command:

```console
$ make clean
```

You must perform first-time compilation for testing. Some additional mandatory packages should be copied to proper location.

```console
$ make compile_wsproxy
```

To run `relay-compiler` with the watch option(`pnpm run relay -- --watch`) on a React project, you need to install `watchman`. If you use Homebrew on Linux, it's a great way to get a recent Watchman build. Please refer to [the official installation guide](https://facebook.github.io/watchman/docs/install).

### Developing / testing without bundling

On a terminal:

```console
$ pnpm run build:d   # To watch source changes
```

On another terminal:

```console
$ pnpm run server:d  # To run dev. web server
```

On yet another terminal:

```console
$ pnpm run wsproxy  # To run websocket proxy
```

If you want to change port for your development environment, Add your configuration to `/react/.env.development` file in the project:

```
PORT=YOURPORT
```

Defaultly, `PORT` is `9081`

### Lint Checking

```console
$ pnpm run lint  # To check lints
```

### Unit Testing

The project uses `Playwright` as E2E testing framework and `Jest` as JavaScript testing framework.

#### Playwright test

To perform E2E tests, you must run complete Backend.AI cluster before starting test.
On a terminal:

```console
$ pnpm run server:d  # To run dev. web server
```

On another terminal:

```console
$ pnpm run test      # Run tests (tests are located in `tests` directory)
```

#### Visual Regression test

To perform visual regression tests,
On a terminal;

```console
$ pnpm playwright test e2e/visual_regression
```

You can see screenshots in `e2e/snapshots`.

If you want to update screenshots due to UI changes, On a terminal;

```console
$ pnpm playwright test e2e/visual_regression --update-snapshots
```

Also, If you want to see visual regression test report, On a terminal;

```console
$ pnpm exec playwright show-report
```

#### Jest test

To perform JavaScript test,
On a terminal;

```console
$ pnpm run test  # For ./src
$ cd ./react && pnpm run test  # For ./react
```

### Electron (app mode) development / testing

#### Live testing

On a terminal:

```console
$ pnpm run server:d    # To run test server
```

OR

```console
$ pnpm run server:p    # To run compiled source
```

On another terminal:

```console
$ pnpm run electron:d  # Run Electron as dev mode.
```

### Development tools

#### Recommended: VSCode Relay GraphQL Extension

For developing with Relay in your React application, it is highly recommended to install the [VSCode Relay GraphQL extension](https://marketplace.visualstudio.com/items?itemName=meta.relay). This extension provides various features to enhance your development experience with Relay.

**Installation Steps:**

1. Open VSCode and navigate to the Extensions view.
2. Search for `Relay` and find the `Relay - GraphQL` extension by Meta.
3. Click the `Install` button to add the extension to your VSCode.

**Configuration:**
After installing the extension, add the following configuration to your `./vscode/settings.json` file:

```json
{
  "relay.rootDirectory": "react"
}
```

## Serving Guide

### Preparing bundled source

```console
$ make compile
```

Then bundled resource will be prepared in `build/rollup`. Basically, both app and web serving is based on static serving sources in the directory. However, to work as single page application, URL request fallback is needed.

If you want to create the bundle zip file,

```console
$ make bundle
```

will generate compiled static web bundle at `./app` directory. Then you can serve the web bundle via webservers.

### Serving with nginx

If you need to serve with nginx, please install and setup `backend.ai-wsproxy` package for websocket proxy. Bundled websocket proxy is simplified version for single-user app.

This is nginx server configuration example. [APP PATH] should be changed to your source path.

```nginx
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

Make sure that you compile the Web UI.

e.g. You will download the `backend.ai-webserver` package.

```console
$ make compile
```

#### Backend.AI WebServer

Good for develop phase. Not recommended for production environment.

Note: This command will use Web UI source in `build/rollup` directory. No certificate will be used therefore web server will serve as HTTP.

Copy `webserver.example.conf` in `docker_build` directory into current directory as `webserver.conf` and modify configuration files for your needs.

```console
$ docker-compose build webui-dev  # build only
$ docker-compose up webui-dev     # for testing
$ docker-compose up -d webui-dev  # as a daemon
```

Visit `http://127.0.0.1:8080` to test web server.

#### Backend.AI WebServer with SSL

Recommended for production.

Note: You have to enter the certificates (`chain.pem` and `priv.pem`) into `certificates` directory. Otherwise, you will have an error during container initialization.

Copy `webserver.example.ssl.conf` in `docker_build` directory into current directory as `webserver.conf` and modify configuration files for your needs.

```console
$ docker-compose build webui  # build only
$ docker-compose up webui     # for testing
$ docker-compose up -d webui  # as a daemon
```

Visit `https://127.0.0.1:443` to test web server serving. Change `127.0.0.1` to your production domain.

#### Removing

```console
$ docker-compose down
```

#### Manual image build

```console
$ make compile
$ docker build -t backendai-webui .
```

Testing / Running example

Check your image name is `backendai-webui_webui` or `backendai-webui_webui-ssl`. Otherwise, change the image name in the script below.

```console
$ docker run --name backendai-webui -v $(pwd)/config.toml:/usr/share/nginx/html/config.toml -p 80:80 backendai-webui_webui /bin/bash -c "envsubst '$$NGINX_HOST' < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
$ docker run --name backendai-webui-ssl -v $(pwd)/config.toml:/usr/share/nginx/html/config.toml -v $(pwd)/certificates:/etc/certificates -p 443:443 backendai-webui_webui-ssl /bin/bash -c "envsubst '$$NGINX_HOST' < /etc/nginx/conf.d/default-ssl.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
```

### Building / serving with webserver

If you need to serve as webserver (ID/password support) without compiling anything, you can use pre-built code through webserver submodule.

To download and deploy web UI from pre-built source, do the following in `backend.ai` repository:

```console
$ git submodule update --init --checkout --recursive
```

### Running websocket proxy with node.js

This is only needed with pure ES6 dev. environment / browser. Websocket proxy is embedded in Electron and automatically starts.

```console
$ pnpm run wsproxy
```

If webui app is behind an external http proxy, and you have to pass through
it to connect to a webserver or manager server, you can set
`EXT_HTTP_PROXY` environment variable with the address of the http proxy.
Local websocket proxy then communicates with the final destination via the http
proxy. The address should include the protocol, host, and/or port (if exists).
For example,

```console
$ export EXT_HTTP_PROXY=http://10.20.30.40:3128 (Linux)
$ set EXT_HTTP_PROXY=http://10.20.30.40:3128 (Windows)
```

Even if you are using Electron embedded websocket proxy, you have to set the
environment variable manually to pass through a http proxy.

## Build web server with specific configuration

You can prepare site-specific configuration as `toml` format. Also, you can build site-specific web bundle refering in `configs` directory.

Note: Default setup will build `es6-bundled` version. If you want to use `es6-unbundled`, make sure that your webserver supports HTTP/2 and setup as HTTPS with proper certification.

```console
$ make web site=[SITE CONFIG FILE POSTFIX]
```

If no prefix is given, default configuration file will be used.

Example:

```console
$ make web site=beta
```

You can manually modify config.toml for your need.

## App Building Guide

### Building Electron App

Electron building is automated using `Makefile`.

```console
$ make clean      # clean prebuilt codes
$ make mac        # build macOS app (both Intel/Apple)
$ make mac_x64    # build macOS app (Intel x64)
$ make mac_arm64  # build macOS app (Apple Silicon)
$ make win        # build win64 app
$ make linux      # build linux app
$ make all        # build win64/macos/linux app
```

#### Windows x86-64 version

```console
$ make win
```

Note: Building Windows x86-64 on other than Windows requires Wine > 3.0
Note: On macOS Catalina, use scripts/build-windows-app.sh to build Windows 32bitpackage. From macOS 10.15+, wine 32x is not supported.
Note: Now the `make win` command support only Windows x64 app, therefore you do not need to use `build-windows-app.sh` anymore.

#### macOS version

##### All versions (Intel/Apple)

```console
$ make mac
```

NOTE: Sometimes Apple silicon version compiled on Intel machine does not work.

##### Intel x64

```console
$ make mac_x64
```

##### Apple Silicon (Apple M1 and above)

```console
$ make mac_arm64
```

##### Building app with Code Signing (all platforms)

1. Export keychain from Keychain Access. Exported p12 should contain:

- Certificate for Developer ID Application
- Corresponding Private Key
- Apple Developer ID CA Certificate. Version of signing certificate (G1 or G2) matters, so be careful to check appropriate version!
  To export multiple items at once, just select all items (Cmd-Click), right click one of the selected item and then click "Export n item(s)...".

2. Set following environment variables when running `make mac_*`.

- `BAI_APP_SIGN=1`
- `BAI_APP_SIGN_APPLE_ID="<Apple ID which has access to created signing certificate>"`
- `BAI_APP_SIGN_APPLE_ID_PASSWORD="<App-specific password of target Apple ID>"`
- `BAI_APP_SIGN_IDENTITY="<Signing Identity>"`
- `BAI_APP_SIGN_KEYCHAIN_B64="<Base64 encoded version of exported p12 file>"`
- `BAI_APP_SIGN_KEYCHAIN_PASSWORD="<Import password of exported p12 file>"`
  Signing Identity is equivalent to the name of signing certificate added on Keychain Access.

#### Linux x86-64 version

```console
$ make linux
```

### Packaging as zip files

Note: Packaging usually performs right after app building. Therefore you do not need this option in normal condition.

Note: Packaging macOS disk image requires electron-installer-dmg to make macOS disk image. It requires Python 2+ to build binary for package.

### Manual run to test Electron

Note: There are two Electron configuration files, `main.js` and `main.electron-packager.js`. Local Electron run uses `main.js`, not `main.electron-packager.js` that is used for real Electron app.

```console
$ make dep            # Compile with app dependencies
$ pnpm run electron:d  # OR, ./node_modules/electron/cli.js .
```

The electron app reads the configuration from `./build/electron-app/app/config.toml`, which is copied from the root `config.toml` file during `make clean && make dep`.

If you configure `[server].webServerURL`, the electron app will load the web contents (including `config.toml`) from the designated server.
The server may be either a `pnpm run server:d` instance or a `./py -m ai.backend.web.server` daemon from the mono-repo.
This is known as the "web shell" mode and allows live edits of the web UI while running it inside the electron app.

### Localization

Locale resources are JSON files located in `resources/i18n`.

Currently WebUI supports these languages:

- English
- Korean
- French
- Russian
- Mongolian
- Indonesian

#### Extracting i18n resources

Run

```console
$ make i18n
```

to update / extract i18n resources.

### Adding i18n strings

- Use `_t` as i18n resource handler on lit-element templates.
- Use `_tr` as i18n resource handler if i18n resource has HTML code inside.
- Use `_text` as i18n resource handler on lit-element Javascript code.

#### Example

In lit-html template:

```html
<div>${_t('general.helloworld')}</div>
```

In i18n resource (en.json):

```json
{
  "general": {
    "helloworld": "Hello World"
  }
}
```

#### Adding new language

1.  Copy `en.json` to target language. (e.g. `ko.json`)
2.  Add language identifier to `supportLanguageCodes` in `backend-ai-webui.ts`.
    e.g.

```javascript
  @property({type: Array}) supportLanguageCodes = ["en", "ko"];
```

3.  Add language information to `supportLanguages` in `backend-ai-usersettings-general-list.ts`.

Note: DO NOT DELETE 'default' language. It is used for browser language.

```javascript
  @property({type: Array}) supportLanguages = [
    {name: _text("language.Browser"), code: "default"},
    {name: _text("language.English"), code: "en"},
    {name: _text("language.Korean"), code: "ko"}
  ];
```
