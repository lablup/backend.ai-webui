const path = require('path');
module.exports = {
  mode: 'production',
  target: 'node',
  externals: [/node_modules/, 'bufferutil', 'utf-8-validate'],
  entry: {
    app: ['./manager.js'],
  },
  output: {
    libraryTarget: 'commonjs2',
    filename: 'wsproxy.js',
  },
};
