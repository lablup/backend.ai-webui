import "core-js";
const plugins = [
  '@babel/plugin-transform-runtime',
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-syntax-dynamic-import',
  ['@babel/proposal-decorators', { decoratorsBeforeExport: true } ],
];

const presets = [
  ["@babel/preset-env",
    {
      "useBuiltIns": "entry",
      "targets": {
        "chrome": "58",
        "ie": "11"
      }
    }
  ]
];

module.exports = {presets, plugins};
