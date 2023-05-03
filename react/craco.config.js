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
  webpack: {
    // When you change the this value, you need to clear cache restart the dev server.
    // you can use `rm -rf node_modules/.cache` to clear cache.
    configure: (webpackConfig, { env, paths }) => {
      // Comment out this `if` block. This is for overriding `style-loader` for development.
      // if (env === "development") {
      //   // your overridden `style-loader`
      //   const overrideOptions = {
      //     loader: "style-loader",
      //     options: {
      //       injectType: "styleTag",
      //       insert: function hello(element, options) {
      //         window.setTimeout(function () {
      //           window.__REACT_SHADOW_ROOT__.appendChild(element);
      //         }, 500);
      //       },
      //     },
      //   };

      //   // override `style-loader`
      //   const { isFound, match } = getLoader(
      //     webpackConfig,
      //     loaderByName("style-loader")
      //   );

      //   if (isFound) {
      //     overrideOptions.loader = match.parent[match.index];
      //     match.parent[match.index] = overrideOptions;
      //   }
      // }

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
      if (env === "development") {
        webpackConfig.output.publicPath = "http://127.0.0.1:3081/";
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
