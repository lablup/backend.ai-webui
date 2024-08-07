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

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : T[P] extends object
        ? DeepPartial<T[P]>
        : T[P];
};

type NonNullableItem<T> = NonNullable<NonNullable<NonNullable<T>['items']>>[0];

type NonNullableNodeOnEdges<T extends RelayConnection | null> = NonNullable<
  NonNullable<NonNullable<NonNullable<T>['edges'][0]>>['node']
>;
