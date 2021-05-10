import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import { generateSW } from 'rollup-plugin-workbox';
import { terser } from "rollup-plugin-terser";
import { babel, getBabelOutputPlugin } from '@rollup/plugin-babel';

export default {
  input: ['src/components/backend-ai-webui.ts'],
  output: {
    dir: 'build/rollup/dist/components',
    format: 'es',
    sourcemap: false
  },
  plugins: [
    nodeResolve(),
    typescript({
      tsconfig: "./tsconfig.json",
      outDir: "build/rollup/dist/components"
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    //babel({ babelHelpers: 'runtime' }),
    getBabelOutputPlugin({
      presets: ['@babel/preset-env']
    }),
    terser(),
    generateSW( {
      swDest: 'build/rollup/sw.js',
      globDirectory: 'build/rollup/',
      globPatterns: ["dist/**/*.{html,json,js,css}",
        "src/lib/**/*.{js, map}"],
  	  skipWaiting: true,
    })
//    babel()
  ]
};
