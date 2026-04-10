const HtmlWebpackPlugin = require('html-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');
const path = require('path');
const fs = require('fs');

const {
  getLoader,
  loaderByName,
  addBeforeLoader,
  addBeforeAssetModule,
  getAssetModule,
  assetModuleByName,
  whenDev,
} = require('@craco/craco');

const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

module.exports = {
  eslint: {
    enable: false, // Disable ESLint webpack plugin for ESLint 9 compatibility. Use CLI lint instead.
  },
  devServer: (devServerConfig, { env, paths }) => {
    // Serve static files from the root project directory so that
    // /resources/*, /config.toml, /manifest/*, /dist/* are available
    // without a separate static file server.
    const projectRoot = path.resolve(__dirname, '..');
    const existingStatic = devServerConfig.static
      ? Array.isArray(devServerConfig.static)
        ? devServerConfig.static
        : [devServerConfig.static]
      : [];
    // Project root comes first so that config.toml, resources/, manifest/,
    // etc. are resolved from the canonical location even if react/public/
    // happens to contain a stale copy.
    devServerConfig.static = [
      {
        directory: projectRoot,
        publicPath: '/',
        // Disable file watching on the static directory to prevent full page
        // reloads when static assets (resources/, dist/, manifest/) change.
        // HMR handles React component updates; static files are served as-is.
        watch: false,
      },
      ...existingStatic,
    ];

    // Enable HMR explicitly and disable liveReload to prevent full page reloads
    // when HMR updates can handle the change.
    devServerConfig.hot = true;
    devServerConfig.liveReload = false;

    // Override deprecated middleware options with setupMiddlewares
    const originalOnBefore = devServerConfig.onBeforeSetupMiddleware;
    const originalOnAfter = devServerConfig.onAfterSetupMiddleware;

    if (originalOnBefore || originalOnAfter) {
      delete devServerConfig.onBeforeSetupMiddleware;
      delete devServerConfig.onAfterSetupMiddleware;

      devServerConfig.setupMiddlewares = (middlewares, devServer) => {
        if (originalOnBefore) {
          originalOnBefore(devServer);
        }
        if (originalOnAfter) {
          originalOnAfter(devServer);
        }
        return middlewares;
      };
    }

    // Watch config.toml, index.html, and i18n translation files for changes
    // and trigger a full page reload.
    // We cannot rely on devServerConfig.watchFiles for this because liveReload is
    // set to false (to prevent HMR fallback reloads on React source changes). In
    // webpack-dev-server v4, the watchFiles mechanism checks liveReload before
    // sending the browser reload signal, so with liveReload:false, file changes
    // are detected but the reload signal is never sent. We work around this by
    // setting up fs.watch watchers in setupMiddlewares that explicitly send the
    // 'static-changed' WebSocket message to trigger a full page reload.
    const existingSetupMiddlewares = devServerConfig.setupMiddlewares;
    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      if (existingSetupMiddlewares) {
        middlewares = existingSetupMiddlewares(middlewares, devServer);
      }

      const filesToWatch = [
        path.resolve(__dirname, '../config.toml'),
        path.resolve(__dirname, '../index.html'),
        // Watch the i18n directory so that changes to translation JSON files
        // trigger a full page reload. i18next-http-backend fetches these files
        // at runtime (they are not bundled by webpack), so a page reload is
        // needed to re-fetch the updated translations.
        path.resolve(__dirname, '../resources/i18n'),
        // Watch theme.json so that theme customization changes during development
        // trigger a full page reload.
        path.resolve(__dirname, '../resources/theme.json'),
      ];

      // Use a single shared debounce timer across all watchers so that
      // simultaneous events (e.g. on macOS where FSEvents can fire watchers
      // for sibling files in the same directory) coalesce into a single
      // reload signal. This also handles editors that write files in
      // multiple steps (e.g. write + rename).
      // Store the debounce timer on devServer so it can be cleared during
      // shutdown (see onListening below).
      const sendReload = () => {
        clearTimeout(devServer._reloadDebounceTimer);
        devServer._reloadDebounceTimer = setTimeout(() => {
          devServer.sendMessage(
            devServer.webSocketServer.clients,
            'static-changed',
          );
        }, 300);
      };

      const watchers = filesToWatch
        .filter((file) => fs.existsSync(file))
        .map((file) => {
          const isDir = fs.statSync(file).isDirectory();
          if (isDir) {
            // Directories: use fs.watch (fs.watchFile doesn't work on dirs)
            return fs.watch(file, () => sendReload());
          }
          // Files: use fs.watchFile (polling) so that watchers survive
          // file replacements from editors that use atomic save
          // (write temp → rename), which causes fs.watch to stop working
          // because the original inode is replaced.
          fs.watchFile(file, { interval: 500 }, (curr, prev) => {
            if (curr.mtimeMs !== prev.mtimeMs) {
              sendReload();
            }
          });
          // Return a close handle compatible with fs.watch watchers
          return { close: () => fs.unwatchFile(file) };
        });

      // Store watchers on the devServer instance so onListening can patch
      // server.close to clean them up on shutdown. We cannot patch
      // devServer.server.close here because devServer.server is not yet
      // created at setupMiddlewares time (createServer() runs after
      // setupMiddlewares() in webpack-dev-server v4's initialize() flow).
      devServer._fileWatchers = (devServer._fileWatchers || []).concat(
        watchers,
      );

      return middlewares;
    };

    // Patch devServer.server.close to close file watchers on shutdown.
    // This runs after server.listen(), so devServer.server is guaranteed
    // to exist here (unlike in setupMiddlewares which runs before createServer()).
    const existingOnListening = devServerConfig.onListening;
    devServerConfig.onListening = (devServer) => {
      if (existingOnListening) {
        existingOnListening(devServer);
      }
      const originalClose = devServer.server.close.bind(devServer.server);
      devServer.server.close = (callback) => {
        // Clear any pending debounce timer to prevent sendReload from
        // firing after the server has been shut down.
        clearTimeout(devServer._reloadDebounceTimer);
        (devServer._fileWatchers || []).forEach((w) => w.close());
        originalClose(callback);
      };
    };

    return devServerConfig;
  },
  babel: {
    plugins: ['@babel/plugin-syntax-import-attributes'],
  },
  webpack: {
    // When you change the this value, you might need to clear cache restart the dev server.
    // you can use `rm -rf node_modules/.cache` to clear cache.
    configure: (webpackConfig, { env, paths }) => {
      // Override lodash-es's `sideEffects: false` package.json flag.
      // lodash-es/lodash.default.js attaches chain sequence methods (groupBy,
      // map, flatten, ...) onto the `lodash` wrapper prototype at module init.
      // With sideEffects: false, webpack tree-shakes this file away when only
      // named exports are used (e.g. `import * as _ from 'lodash-es'` +
      // `_.chain(x).groupBy(...)`), which breaks chain sequences at runtime
      // with `...default(...).groupBy is not a function`. Marking these two
      // files as having side effects forces webpack to evaluate them so the
      // mixin runs.
      webpackConfig.module.rules.unshift({
        test: /[\\/]node_modules[\\/]lodash-es[\\/]lodash(\.default)?\.js$/,
        sideEffects: true,
      });

      // `some.file?raw` will be treated as `asset/source`
      const { isFound, match } = getAssetModule(webpackConfig, (rule) => {
        return rule.oneOf;
      });

      const babelLoader = webpackConfig.module.rules
        .find((rule) => rule.oneOf)
        .oneOf.find(
          (rule) => rule.loader && rule.loader.includes('babel-loader'),
        );

      if (babelLoader && babelLoader.options) {
        babelLoader.options.plugins = babelLoader.options.plugins || [];
        babelLoader.options.plugins.push([
          'babel-plugin-react-compiler',
          {
            compilationMode: 'annotation',
          },
        ]);
        babelLoader.options.overrides = [
          {
            include: [
              (filePath) => filePath.includes(path.resolve(__dirname, 'src')),
            ], // include only react/src folder
            plugins: [
              [
                'relay',
                {
                  artifactDirectory: path.resolve(
                    __dirname,
                    'src/__generated__',
                  ),
                },
              ],
            ],
          },
          {
            include: [
              (filePath) => {
                const targetDir = path.resolve(
                  __dirname,
                  '../packages/backend.ai-ui/src',
                );
                return filePath.includes(targetDir);
              },
            ], // include only backend.ai-ui/src folder
            plugins: [
              [
                'relay',
                {
                  artifactDirectory: path.resolve(
                    __dirname,
                    '../packages/backend.ai-ui/src/__generated__',
                  ),
                },
              ],
            ],
          },
        ];
      }

      if (isFound) {
        match.rule.oneOf = [
          {
            test: /\.svg$/i,
            resourceQuery: /react/,

            issuer: /\.[jt]sx?$/,
            use: ['@svgr/webpack'],
          },
          {
            resourceQuery: /raw/,
            type: 'asset/source',
          },
          ...match.rule.oneOf,
        ];
      } else {
        throw new Error('Cannot find asset module');
      }

      // Configure TypeScript loader for files in alias directories
      if (env === 'development') {
        const { isFound: tsLoaderFound, match: tsMatch } = getLoader(
          webpackConfig,
          loaderByName('babel-loader'),
        );

        if (tsLoaderFound) {
          // Extend the include path to handle aliased directories
          const backendAiUiPath = path.resolve(
            __dirname,
            '../packages/backend.ai-ui/src',
          );
          if (tsMatch.loader.include) {
            if (Array.isArray(tsMatch.loader.include)) {
              tsMatch.loader.include.push(backendAiUiPath);
            } else {
              tsMatch.loader.include = [
                tsMatch.loader.include,
                backendAiUiPath,
              ];
            }
          } else {
            tsMatch.loader.include = [paths.appSrc, backendAiUiPath];
          }
        }
      }

      // For development when loading react bundle on other host, you need to set the public path to the dev server address.
      if (process.env.BUILD_TARGET === 'electron') {
        webpackConfig.output.publicPath = 'es6://';
      }

      // use `index.html` of original webUI` instead of using react specific one.
      const webuiIndexHtml = path.resolve(__dirname, '../index.html');
      webpackConfig.plugins = webpackConfig.plugins.map((plugin) => {
        if (plugin.constructor.name === 'HtmlWebpackPlugin') {
          if (env === 'development') {
            const content = fs.readFileSync(webuiIndexHtml, {
              encoding: 'utf-8',
            });

            // Use templateContent for the initial template content injection.
            // The `template` path is also provided so HtmlWebpackPlugin can
            // track the file for changes. Note: templateContent takes precedence
            // over template when both are specified; the template path here is
            // used only as a reference for webpack's dependency tracking to
            // enable proper HMR behavior when the HTML file changes.
            plugin = new HtmlWebpackPlugin({
              inject: true,
              template: webuiIndexHtml,
              templateContent: content.replace(
                '// DEV_JS_INJECTING',
                'globalThis.process = {env: {NODE_ENV: "development"}};',
              ),
            });
          } else {
            plugin = new HtmlWebpackPlugin({
              inject: true,
              template: webuiIndexHtml,
              minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
              },
            });
          }
        }

        return plugin;
      });
      paths.appHtml = webuiIndexHtml;

      // Configure webpack's own file watcher to ignore files that are not
      // part of the webpack module graph. When webpack resolves aliases
      // outside react/ (e.g. backend.ai-client-esm → ../dist/lib/...),
      // enhanced-resolve walks up the directory tree and adds the project
      // root as a context dependency. This causes webpack to watch ALL files
      // in the project root, triggering unnecessary rebuilds when config
      // files or editor temp files change (which leads to HMR "Cannot find
      // update" → full page reload).
      //
      // We use a single RegExp instead of a string array because webpack
      // validates that ignored arrays contain only strings (no RegExp),
      // and we need pattern matching to catch editor temp files.
      //
      // The RegExp ignores:
      // 1. node_modules everywhere
      // 2. resources/ and manifest/ directories (static assets)
      // 3. All files directly in the project root (config.toml, index.html,
      //    editor temp files like .config.toml.XXXXX, etc.)
      //
      // NOT ignored (must remain watched):
      // - dist/lib/backend.ai-client-esm.js (webpack alias, needs HMR)
      // - packages/backend.ai-ui/src/** (workspace package, dev alias)
      if (env === 'development') {
        const escapedRoot = path
          .resolve(__dirname, '..')
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        webpackConfig.watchOptions = {
          ...webpackConfig.watchOptions,
          ignored: new RegExp(
            [
              'node_modules',
              escapedRoot + '[\\\\/]resources[\\\\/]',
              escapedRoot + '[\\\\/]manifest[\\\\/]',
              // Match files directly in the project root (no deeper path
              // separators). This catches config.toml, index.html, and any
              // temp files created by editors during atomic save operations.
              escapedRoot + '[\\\\/][^\\\\/]+$',
            ].join('|'),
          ),
        };
      }

      // Remove ModuleScopePlugin to allow imports outside react/src.
      // Needed for: backend.ai-ui package, backend.ai-client-esm (via alias to dist/lib/)
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        (plugin) =>
          !(
            plugin instanceof ModuleScopePlugin ||
            plugin.constructor.name === 'ModuleScopePlugin'
          ),
      );

      // Generate service worker for production builds using Workbox.
      // This replaces the previous Rollup-based service worker generation.
      if (env === 'production') {
        webpackConfig.plugins.push(
          new GenerateSW({
            swDest: 'sw.js',
            skipWaiting: true,
            clientsClaim: true,
            exclude: [/\.map$/, /asset-manifest\.json$/],
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
          }),
        );
      }

      return {
        ...webpackConfig,
        resolve: {
          ...webpackConfig.resolve,
          alias: {
            ...webpackConfig.resolve.alias,
            // Backend.AI client ESM library (used by global-stores.ts to set globalThis classes)
            'backend.ai-client-esm': path.resolve(
              __dirname,
              '../dist/lib/backend.ai-client-esm.js',
            ),
            ...whenDev(
              () => ({
                'backend.ai-ui/dist': path.resolve(
                  __dirname,
                  '../packages/backend.ai-ui/src',
                ),
                'backend.ai-ui': path.resolve(
                  __dirname,
                  '../packages/backend.ai-ui/src',
                ),
              }),
              {},
            ),
          },
          fallback: {
            ...webpackConfig.resolve.fallback,
            buffer: require.resolve('buffer'),
            stream: require.resolve('stream-browserify'),
            child_process: false,
          },
        },
        ignoreWarnings: [
          {
            module: /@melloware\/react-logviewer/,
            message: /Failed to parse source map/,
          },
          {
            module: /@antv\//,
            message: /Failed to parse source map/,
          },
          {
            module: /@microsoft\/fetch-event-source/,
            message: /Failed to parse source map/,
          },
        ],
      };
    },
  },
};
