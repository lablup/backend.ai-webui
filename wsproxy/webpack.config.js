const path = require('path');
const nodeExternals = require('webpack-node-externals');
module.exports = {
  mode: 'production',
  target: "node",
  entry: {
    app: ["./web.js"]
  },
  output: {
    libraryTarget: 'commonjs2',
    filename: "wsproxy.js",
    path: path.resolve(__dirname, ".."),
  },
  externals: [nodeExternals()],
};
