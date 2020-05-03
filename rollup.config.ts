import resolve from '@rollup/plugin-node-resolve';
//import babel from 'rollup-plugin-babel'; // To support legacy browsers
import typescript from 'rollup-plugin-typescript';
//import typescript from 'rollup-plugin-typescript2';
//import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";

export default {
  input: ['src/components/backend-ai-console.ts'],
  output: {
    dir: 'build/rollup/dist/components',
    format: 'es',
    sourcemap: false
  },
  plugins: [
    typescript(),
    terser(),
    resolve()
//    babel()
  ]
};
