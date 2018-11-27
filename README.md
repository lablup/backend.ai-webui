# backend.ai-admin-console

Web-based Backend.AI administration GUI console.

## Develop and Test

```
$ npm install -g polymer-cli
$ npm install
$ polymer serve --npm
```

## Build (Web)

```
$ polymer build
```

## Build (App)

```
$ polymer build
$ cd build/es6-unbundled
$ npm install --only=prod
$ cd ../..
$ npm start
```