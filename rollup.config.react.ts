import typescript from '@rollup/plugin-typescript';
import babel from "@rollup/plugin-babel";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import autoprefixer from 'autoprefixer';
import postcss from 'rollup-plugin-postcss';

export default {
  //preserveModules: true,
  input: ['src/components-react/hello.tsx'],
  output: {
    // dir: 'build/rollup/dist/components-react',
    dir: 'src/components-react/dist',
    format: 'esm',
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
    postcss({
      plugins: [autoprefixer()],
      sourceMap: true,
      modules: true,
      extract: false,
      minimize: true
    }),
    typescript({
      tsconfig: "./tsconfig.react.json",
      outDir: 'src/components-react/dist'
    }),
  ]
};

