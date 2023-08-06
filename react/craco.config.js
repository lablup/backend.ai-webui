const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const {
  getLoader,
  loaderByName,
  addBeforeLoader,
  addBeforeAssetModule,
  getAssetModule,
  assetModuleByName,
} = require("@craco/craco");

module.exports = {
  devServer: {
    proxy: {
      context: [
        "/src",
        "/config.toml",
        "/manifest",
        "/dist",
        "/resources",
        "/node_modules",
      ],
      target: "http://localhost:3081",
    },
    watchFiles: [
      "../index.html",
      "../config.toml",
      "../manifest/**/*",
      "../dist/**/*",
      "../resources/**/*",
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
            type: "asset/source",
          },
          ...match.rule.oneOf,
        ];
      } else {
        throw new Error("Cannot find asset module");
      }

      // For development when loading react bundle on other host, you need to set the public path to the dev server address.
      if (process.env.BUILD_TARGET === "electron") {
        webpackConfig.output.publicPath = "es6://";
      }

      // use `index.html` of original webUI` instead of using react specific one.
      const webuiIndexHtml = path.resolve(__dirname, "../index.html");
      webpackConfig.plugins = webpackConfig.plugins.map((plugin) => {
        if (plugin.constructor.name === "HtmlWebpackPlugin") {
          if (env === "development") {
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

      return webpackConfig;
    },
  },
};
