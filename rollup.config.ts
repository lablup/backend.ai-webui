import resolve from '@rollup/plugin-node-resolve';
//import babel from 'rollup-plugin-babel'; // To support legacy browsers
import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";
//import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';

export default {
  // If using any exports from a symlinked project, uncomment the following:
  // preserveSymlinks: true,
  input: ['src/components/backend-ai-console.ts'],
  output: {
    dir: 'build/rollup/dist/components',
    format: 'es',
    sourcemap: false
  },
  plugins: [
    //babel(),
    typescript(),
    terser(),
    resolve()
//    babel()
  ]
};
