const plugins = [
  '@babel/plugin-transform-class-properties',
  '@babel/plugin-syntax-dynamic-import',
  ['@babel/proposal-decorators', { decoratorsBeforeExport: true } ],
];
// warning @babel/plugin-proposal-class-properties@7.18.6: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-class-properties instead.
// [react-dependencies] npm WARN deprecated @babel/plugin-proposal-private-property-in-object@7.21.11: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-private-property-in-object instead.

module.exports = {plugins};
