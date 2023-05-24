const { hmrPlugin, presets } = require('@open-wc/dev-server-hmr');


module.exports = {
  open: false,
  watch: true,
  plugins: [
    {
      // This plugin is for injecting the react bundle bto the index.html. (only for development)
      // For production, the react bundle is injected by react project. Please check `build` script in react/package.json
      name: "inject-react-bundle-script-for-dev",
      transform(ctx) {
        if (ctx.url.startsWith("/index.html")) {
          return {
            body: ctx.body.replace(
              /<!-- REACT_BUNDLE_INJECTING FOR DEV-->/gs,
              '<script defer src="http://127.0.0.1:3081/static/js/bundle.js"></script>'
            ),
          };
        }
      },
    },
    hmrPlugin({
      include: ['src/**/*'],
      // only v3
      // presets: [presets.lit],
      // only v2
      // presets: [presets.litElement],
      // both v3 & v2
      presets: [presets.lit, presets.litElement],
    }),
  ],
};
