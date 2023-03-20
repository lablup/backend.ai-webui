module.exports = {
  plugins: [
    {
      // This plugin is for injecting the react bundle to the index.html. (only for development)
      // For production, the react bundle is injected by react project. Please check `build` script in backend-ai-webui-react/package.json
      name: "remove-injected-watch-script",
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
  ],
};
