import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import { generateSW } from 'rollup-plugin-workbox';
import terser from '@rollup/plugin-terser';
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
    input: ['src/components/backend-ai-webui.ts'],
    output: {
      dir: 'build/rollup/dist/components',
      format: 'es',
      sourcemap: false
    },
    plugins: plugins('build/rollup/dist/components')
  },
];