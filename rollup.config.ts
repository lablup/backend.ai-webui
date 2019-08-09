import resolve from 'rollup-plugin-node-resolve';
//import babel from 'rollup-plugin-babel'; // To support legacy browsers
import { terser } from "rollup-plugin-terser";
import typescript from 'rollup-plugin-typescript';

export default {
  // If using any exports from a symlinked project, uncomment the following:
  // preserveSymlinks: true,
  input: ['src/components/backend-ai-console.ts'],
  output: {
    dir: 'build/rollup/src/components',
    format: 'es',
    sourcemap: false
  },
  plugins: [
    typescript(),
    terser(),
    //babel(),
    resolve()
  ]
};
