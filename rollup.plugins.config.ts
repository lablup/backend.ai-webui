import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import { generateSW } from 'rollup-plugin-workbox';
import terser from '@rollup/plugin-terser';
import { globSync } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
//import babel from 'rollup-plugin-babel'; // To support legacy browsers. Disabled by default.

const plugins = (outDir) =>  [
  nodeResolve(),
  typescript({
    tsconfig: "./tsconfig.json",
    outDir: outDir
  }),
  replace({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  terser(),
  generateSW( {
    swDest: 'build/rollup/sw.js',
    globDirectory: 'build/rollup/',
    globPatterns: [
      'dist/**/*.{html,json,js,css}',
      'src/lib/**/*.{js, map}'
    ],
    skipWaiting: true,
  })
//    babel()
];

export default [
  {
    // ref: https://rollupjs.org/configuration-options/#input
    input: Object.fromEntries(
      globSync('src/plugins/**/*.ts').map(file => [
        // This remove `src/` as well as the file extension from each
        // file, so e.g. src/nested/foo.js becomes nested/foo
        path.relative(
          'src/plugins',
          file.slice(0, file.length - path.extname(file).length)
        ),
        // This expands the relative paths to absolute paths, so e.g.
        // src/nested/foo becomes /project/src/nested/foo.js
        fileURLToPath(new URL(file, import.meta.url))
      ])
    ),
    output: {
      dir: 'build/rollup/dist/plugins',
      format: 'es',
      sourcemap: false
    },
    plugins: plugins('build/rollup/dist/plugins')
  }
];
