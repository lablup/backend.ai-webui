const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const {
  getLoader,
  loaderByName,
  addBeforeLoader,
  addBeforeAssetModule,
  getAssetModule,
  assetModuleByName,
} = require('@craco/craco');

module.exports = {
  devServer: {
    watchFiles: [
      '../index.html',
      '../config.toml',
      '../manifest/**/*',
      '../dist/**/*',
      '../resources/**/*',
    ],
  },
  babel: {
    plugins: [
      '@babel/plugin-syntax-import-attributes',
    ],
  },
  webpack: {
    // When you change the this value, you might need to clear cache restart the dev server.
    // you can use `rm -rf node_modules/.cache` to clear cache.
    configure: (webpackConfig, { env, paths }) => {
      // `some.file?raw` will be treated as `asset/source`
      const { isFound, match } = getAssetModule(webpackConfig, (rule) => {
        return rule.oneOf;
      });

      if (isFound) {
        match.rule.oneOf = [
          {
            resourceQuery: /raw/,
            type: 'asset/source',
          },
          ...match.rule.oneOf,
        ];
      } else {
        throw new Error('Cannot find asset module');
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

      return {
        ...webpackConfig,
        resolve: {
          ...webpackConfig.resolve,
          fallback: {
            ...webpackConfig.resolve.fallback,
            buffer: require.resolve('buffer'),
            stream: require.resolve('stream-browserify'),
            child_process: false
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
//             WARNING in ../node_modules/.pnpm/@antv+util@3.3.10/node_modules/@antv/util/esm/lodash/for-in.js
// Module Warning (from ../node_modules/.pnpm/source-map-loader@3.0.2_webpack@5.97.1_esbuild@0.19.12_webpack-cli@5.1.4_webpack@5.93.0__/node_modules/source-map-loader/dist/cjs.js):
// Failed to parse source map from '/Users/codejong/Workspace/lablup/webui/node_modules/.pnpm/@antv+util@3.3.10/node_modules/@antv/util/esm/lodash/src/lodash/for-in.ts' file: Error: ENOENT: no such file or directory, open '/Users/codejong/Workspace/lablup/webui/node_modules/.pnpm/@antv+util@3.3.10/node_modules/@antv/util/esm/lodash/src/lodash/for-in.ts'
          }
        ],
      };
    },
  },
};
