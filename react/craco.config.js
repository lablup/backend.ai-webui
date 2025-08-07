const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

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
  devServer: (devServerConfig, { env, paths }) => {
    devServerConfig.watchFiles = {
      paths: [
        '../index.html',
        '../config.toml',
        '../manifest/**/*',
        '../dist/**/*',
        '../resources/**/*',
      ],
    };
    
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
            plugin = new HtmlWebpackPlugin({
              inject: true,
              template: webuiIndexHtml,
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

      // Remove ModuleScopePlugin for development environment
      if (env === 'development') {
        webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
          (plugin) =>
            !(
              plugin instanceof ModuleScopePlugin ||
              plugin.name === 'ModuleScopePlugin'
            ),
        );
      }

      return {
        ...webpackConfig,
        resolve: {
          ...webpackConfig.resolve,
          alias: {
            ...webpackConfig.resolve.alias,
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
