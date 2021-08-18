const fs = require('fs');
const chalk = require('chalk');

module.exports = {
  input: [
    './src/**/*.ts',
    // Use ! to filter out files or directories
  ],
  output: './',
  options: {
    debug: true,
    func: {
      list: ['_t', '_tr', '_text'], // _t for normal text, _tr for HTML text
      extensions: ['.ts', '.js', '.jsx']
    },
    trans: false,
    lngs: ['en', 'ko', 'ru', 'fr', 'mn'],
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

    parser.parseFuncFromString(content, {list: ['_t']}, (key, options) => {
      parser.set(key, Object.assign({}, options, {
        nsSeparator: false,
        keySeparator: '.'
      }));
      ++count;
    });

    if (count > 0) {
      console.log(`i18next-scanner: count=${chalk.cyan(count)}, file=${chalk.yellow(JSON.stringify(file.relative))}`);
    }

    done();
  }
};
