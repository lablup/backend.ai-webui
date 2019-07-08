import resolve from 'rollup-plugin-node-resolve';

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
    resolve()
  ]
};
