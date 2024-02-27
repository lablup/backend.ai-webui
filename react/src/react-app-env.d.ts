/// <reference types="react-scripts" />

declare module 'babel-plugin-relay/macro' {
  export { graphql as default } from 'react-relay';
}

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any
  ? A
  : never;

//TODO: fix this declaration for globalThis. It's not working.
declare global {
  var isDarkMode: boolean;
}
