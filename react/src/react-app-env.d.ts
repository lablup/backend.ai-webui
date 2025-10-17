/// <reference types="react-scripts" />

// declare module 'babel-plugin-relay/macro' {
//   export { graphql as default } from 'react-relay';
// }
type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
// eslint-disable-next-line @typescript-eslint/ban-types
type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any
  ? A
  : never;

declare module globalThis {
  // eslint-disable-next-line no-var
  var isDarkMode: boolean;
  // eslint-disable-next-line no-var
  var isElectron: boolean;
  // eslint-disable-next-line no-var
  var electronInitialHref: string;
  // eslint-disable-next-line no-var
  var appLauncher: {
    showLauncher?: (sessionId: {
      'session-name'?: string;
      'session-uuid'?: string;
      'access-key'?: string;
      mode?: SessionMode;
      'app-services'?: Array<string>;
      runtime?: string;
      filename?: string;
    }) => void;
    forceUseV1Proxy?: {
      checked: boolean;
    };
    forceUseV2Proxy?: {
      checked: boolean;
    };
  };
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

type SelectivePartial<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

type OptionalFieldsOnly<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T as {} extends Pick<T, K> ? K : never]?: T[K];
};

type NonNullableItem<T> = NonNullable<NonNullable<NonNullable<T>['items']>>[0];

type NonNullableNodeOnEdges<T extends RelayConnection | null> = NonNullable<
  NonNullable<NonNullable<NonNullable<T>['edges'][0]>>['node']
>;
