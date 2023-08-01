/// <reference types="react-scripts" />

declare module "babel-plugin-relay/macro" {
  export { graphql as default } from "react-relay";
}

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
