const fs = require('fs');
const chalk = require('chalk');

module.exports = {
  input: [
    './src/**/*.ts',
    './react/src/**/*.tsx',
    // Use ! to filter out files or directories
  ],
  output: './',
  options: {
    debug: true,
    removeUnusedKeys: false,
    func: {
      list: ['_t', '_tr', '_text', 't'], // _t for normal text, _tr for HTML text, t for react
      extensions: ['.ts', '.js', '.jsx', '.tsx']
    },
    trans: false,
    lngs: ['en', 'ko', 'ru', 'fr', 'ja', 'zh_CN', 'zh_TW', 'mn', 'id', 'pt'],
    defaultLng: 'en',
    defaultNs: 'resource',
    defaultValue: function(lng, ns, key) {
      if (lng === 'en') {
        // Return key as the default value for English language
        return key;
      }
      // Return the string '__NOT_TRANSLATED__' for other languages
      return '__NOT_TRANSLATED__';
    },
    resource: {
      loadPath: 'resources/i18n/{{lng}}.json',
      savePath: 'resources/i18n/{{lng}}.json',
      jsonIndent: 2,
      lineEnding: '\n'
    },
    nsSeparator: ':', // '.',//false, // namespace separator
    keySeparator: '.', // false, // key separator
    interpolation: {
      prefix: '{{',
      suffix: '}}'
    }
  },
  transform: function customTransform(file, enc, done) {
    'use strict';
    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);
    let count = 0;

    parser.parseFuncFromString(content, {list: ['_t', 't']}, (key, options) => {
      parser.set(key, Object.assign({}, options, {
        nsSeparator: false,
        keySeparator: '.'
      }));
      ++count;
    });

    let colored = file.path.includes('/react/src') ? chalk.magenta : chalk.yellow;

    if (count > 0) {
      console.log(`i18next-scanner: count=${chalk.cyan(count)}, file=${colored(JSON.stringify(file.relative))}`);
    }

    done();
  }
};
