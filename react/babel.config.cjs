const path = require('path');

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: ['@babel/plugin-syntax-import-attributes'],
  overrides: [
    {
      include: ['./src/**/*', path.resolve(__dirname, 'src/**/*')], // include only react/src folder
      plugins: [
        [
          'relay',
          {
            artifactDirectory: path.resolve(__dirname, 'src/__generated__'),
          },
        ],
      ],
    },
    {
      include: [
        '../packages/backend.ai-ui/src/**/*',
        path.resolve(__dirname, '../packages/backend.ai-ui/src/**/*'),
      ], // include only backend.ai-ui/src folder
      plugins: [
        [
          'relay',
          {
            artifactDirectory: path.resolve(
              __dirname,
              '../packages/backend.ai-ui/src/__generated__',
            ),
          },
        ],
      ],
    },
  ],
};
