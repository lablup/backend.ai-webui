import typescript from '@rollup/plugin-typescript';
import babel from "@rollup/plugin-babel";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: ['src/components-react/hello.tsx'],
  output: {
    // dir: 'build/rollup/dist/components-react',
    dir: 'src/components-react/dist',
    format: 'es',
    sourcemap: false
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
      extensions: [".ts", ".tsx"],
    }),
    typescript({
      tsconfig: "./tsconfig.react.json",
      outDir: 'src/components-react/dist'
    }),
  ]
};

