import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { terser } from "rollup-plugin-terser";

export default {
  // If using any exports from a symlinked project, uncomment the following:
  // preserveSymlinks: true,
  input: ['src/components/backend-ai-console.js'],
  output: {
    dir: 'build/rollup/src/components',
    format: 'es',
    sourcemap: false
  },
  plugins: [
    terser(),
    resolve()
    //babel()
  ]
};
