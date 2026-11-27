// e2e helpers reach react/src/helper/const-vars.ts, which re-exports one
// constant from backend.ai-ui; the package has no CommonJS entry, so a drill
// run loads this through NODE_OPTIONS=--require instead.
const Module = require('module');
const load = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'backend.ai-ui') return { SIGNED_32BIT_MAX_INT: 2147483647 };
  return load.call(this, request, ...rest);
};
