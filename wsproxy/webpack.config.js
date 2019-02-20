const path = require('path');
module.exports = {
  mode: 'production',
  target: "node",
  entry: {
    app: ["./web.js"]
  },
  output: {
    libraryTarget: 'commonjs2',
    filename: "wsproxy.js",
  }
};
