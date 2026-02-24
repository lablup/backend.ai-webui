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
    // without a separate webdev server.
    const projectRoot = path.resolve(__dirname, '..');
    const existingStatic = devServerConfig.static
      ? Array.isArray(devServerConfig.static)
        ? devServerConfig.static
        : [devServerConfig.static]
      : [];
    devServerConfig.static = [
      ...existingStatic,
      {
        directory: projectRoot,
        publicPath: '/',
        // Disable file watching on the static directory to prevent full page
        // reloads when static assets (resources/, dist/, manifest/) change.
        // HMR handles React component updates; static files are served as-is.
        watch: false,
      },
    ];

    // Only watch config.toml and index.html for full reloads when they change.
    // Exclude resources/, dist/, and manifest/ because changes to those files
    // (e.g. relay-generated files, CSS assets) should not cause full reloads.
    // The __generated__/ directory is excluded to prevent relay compiler watch
    // mode from triggering unnecessary full page reloads during development.
    devServerConfig.watchFiles = {
      paths: ['../index.html', '../config.toml'],
      options: {
        // Ignore relay-generated files and static assets to prevent full reloads
        ignored: [
          '**/src/__generated__/**',
          '**/node_modules/**',
          '**/dist/**',
          '**/resources/**',
          '**/manifest/**',
        ],
      },
    };

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

    return devServerConfig;
  },
  babel: {
    plugins: ['@babel/plugin-syntax-import-attributes'],
  },
  webpack: {
    // When you change the this value, you might need to clear cache restart the dev server.
    // you can use `rm -rf node_modules/.cache` to clear cache.
    configure: (webpackConfig, { env, paths }) => {
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

      // Configure webpack's own file watcher to ignore static assets that are
      // served directly and don't need to be in the webpack module graph.
      // This prevents webpack from triggering unnecessary rebuilds (and
      // potential HMR fallback to full reload) when static files change.
      if (env === 'development') {
        webpackConfig.watchOptions = {
          ...webpackConfig.watchOptions,
          ignored: [
            // Ignore node_modules (standard exclusion for performance)
            '**/node_modules/**',
            // Ignore static assets that are served directly by webpack-dev-server
            // and are not part of the webpack module graph. These don't need
            // webpack to watch them; the dev server serves them as static files.
            path.resolve(__dirname, '../dist/**'),
            path.resolve(__dirname, '../resources/**'),
            path.resolve(__dirname, '../manifest/**'),
          ],
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
