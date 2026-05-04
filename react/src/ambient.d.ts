/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/// <reference types="vite/client" />
/// <reference types="vitest/globals" />
// Project-wide ambient TypeScript declarations: shared utility types,
// global variables seeded by the host shell, and `Window` augmentations.
// Previously lived in `react-app-env.d.ts` (CRA scaffolding name) — moved
// to `ambient.d.ts` after FR-2611 retired CRA, which also dropped the
// `/// <reference types="react-scripts" />` directive that was the only
// CRA-specific line.
//
// The `<reference types="vitest/globals" />` directive above pulls
// vitest's `vi`, `describe`, `it`, `expect`, etc. into the type system
// without forcing an explicit `"types"` list in `tsconfig.json` (which
// would exclude `@types/jest`, breaking `@testing-library/jest-dom`'s
// default matcher augmentation).

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any
  ? A
  : never;

interface BackendAIOptions {
  get<T = any>(key: string, defaultValue?: T, namespace?: string): T;
  set(key: string, value: any, namespace?: string): void;
  exists(key: string, namespace?: string): boolean;
}

type BackendAIClient = import('./hooks').BackendAIClient;

declare module globalThis {
  // eslint-disable-next-line no-var
  var isDarkMode: boolean;
  // eslint-disable-next-line no-var
  var isElectron: boolean;
  // eslint-disable-next-line no-var
  var electronInitialHref: string;
  // eslint-disable-next-line no-var
  var packageEdition: string;
  // eslint-disable-next-line no-var
  var packageVersion: string;
  // eslint-disable-next-line no-var
  var packageValidUntil: string;
  // eslint-disable-next-line no-var
  var buildVersion: string;
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
  // eslint-disable-next-line no-var
  var backendaiclient: BackendAIClient | null | undefined;
  // eslint-disable-next-line no-var
  var backendaioptions: BackendAIOptions | undefined;
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
  [K in keyof T as {} extends Pick<T, K> ? K : never]?: T[K];
};

type NonNullableItem<T> = NonNullable<NonNullable<NonNullable<T>['items']>>[0];

type NonNullableNodeOnEdges<T extends RelayConnection | null> = NonNullable<
  NonNullable<NonNullable<NonNullable<T>['edges'][0]>>['node']
>;

interface Window {
  switchLanguage: (lang: string) => void;
}
