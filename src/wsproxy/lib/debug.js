const log = require("log");

module.exports = {
  isDebug: process.env['NODE_DEBUG'] && /wstunnel/.test(process.env['NODE_DEBUG'])
};

if (module.exports.isDebug) {
  module.exports.log = msg => log(msg);
} else {
  module.exports.log = function() {};
}
