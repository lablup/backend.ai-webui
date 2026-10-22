# backend.ai-ui

This is a React component project for WebUI.

## Package contract

What a consumer must provide, and what it must import. Everything in this
section was (re)defined by the Astryx migration, ticket 30.

### Peer dependencies

The design-system contract is **Astryx, reached through
`@lablup/ui-common`** (ADR 0009, `docs/adr/0009-ui-common-as-the-single-entry-point-to-astryx.md`):

| Peer                                        | Required? | Why                                                             |
| ------------------------------------------- | --------- | --------------------------------------------------------------- |
| `@lablup/ui-common`                         | yes       | Every Astryx component BUI renders, as `@lablup/ui-common/<X>`. |
| `@astryxdesign/lab`                         | yes       | Backs `@lablup/ui-common/lab` (`BAIDrawer`, tours).             |
| `react` / `react-dom`                       | yes       | —                                                               |
| `react-relay` / `relay-runtime` / `graphql` | yes       | The `fragments/` components are Relay-bound.                    |
| `@tanstack/react-query`                     | yes       | `BAIConfigProvider` owns the QueryClient.                       |
| `react-router-dom`                          | yes       | `BAILink` and friends.                                          |

ui-common depends on `@astryxdesign/core` and `@astryxdesign/theme-neutral` at
exact pins; neither is bundled into BUI's `dist` (`vite.config.ts` keeps every
`@astryxdesign/*` import external). There must be a **single** copy of core: two
copies means two StyleX registries and two React contexts, so a `<Theme>`
mounted by the app would not be seen by BUI's components. If theme values
diverge between app-level and BUI-level components, check for a duplicated
`@astryxdesign/core` first.

### There is no antd surface any more

BUI has **no antd in its source, its peers, or its types**. The last of it went
in the to-astryx final switch, which removed the antd `ConfigProvider` leg of
`BAIConfigProvider` and, with it, the 21 `src/locale/*_*.ts` modules that
existed only to hand antd's `Locale` bundles to that provider (they were also
the `backend.ai-ui/dist/locale/*` package export). The per-language modules
that exist today are a different export, `backend.ai-ui/locale/*`, which
carries Astryx's catalogs instead — see "Localization" below.

The path here is worth knowing, because the intermediate states are still
visible in comments across the package:

- `antd-style` went in ticket 33 — every `createStyles` block became a
  co-located `.css` file next to its component (P17), so no styling engine
  injects `<style>` at runtime.
- Ticket 30 demoted `antd` / `@ant-design/icons` to **optional** peers, which
  made the install-time guarantee ("a consumer touching only the Astryx-native
  surface needs no antd") true while the legacy components still imported it.
  That ticket's own honest caveat was that the guarantee was runtime-only:
  `dist/index.d.ts` still described wrappers in antd's types, so `tsc` against
  the barrel still wanted antd's declarations.
- The final switch closed the type-level hole as well. The two type imports
  that survived every render conversion — `GlobalToken` (the shape
  `theme.useToken()` returns) and `antd/es/locale`'s `Locale` — became a
  frozen `theme-shim` capture and a `BAILocale` that carries only `lang`.
- FR-3605 retired the `theme-shim` itself. Components read tokens through
  Astryx's `useTheme().token()`, and what remains under `src/theme/` is
  measured data, not ported antd code: the alignment tables
  (`antdParity.ts`) and the custom-token builder (`baiCustomTokens.ts`) the
  app's theme recipe and Storybook's brand theme are both built from. They
  are also published on their own as `backend.ai-ui/theme`, so a consumer can
  apply BUI's theme tokens without the component barrel; the app's theme
  recipe imports them from there because `astryx theme build` loads it in
  Node (ADR 0013).

No antd-family package remains, not even in `devDependencies` — the
workspace's exact-pinned `pnpm-lock.yaml` is what keeps it that way.

### CSS

BUI owns one stylesheet, `src/styles/backend.ai-ui.css`, exported as:

```ts
import 'backend.ai-ui/styles.css';
```

`src/index.ts` imports it too, so consumers that bundle BUI **from source**
(this repo's `react/` app does, through the `@backend.ai/source` export
condition — ADR 0013) get it through the module graph and need no explicit
import. Consumers of the built `dist` must import it: a Vite/Rollup library
build strips CSS imports out of the emitted JS and writes
`dist/backend.ai-ui.css` beside it.

`package.json#sideEffects` is `["**/*.css"]`, **not** `false`. It was `false`
before ticket 30, which is why the icon baseline had to be injected imperatively
from `iconShim.tsx` — a `false` value licenses a bundler to drop a bare CSS
import entirely.

#### @layer requirement

Every rule BUI ships lives in `@layer components`, and BUI's stylesheet opens
with the full order statement:

```css
@layer reset, theme, base, astryx-base, astryx-theme, ui-common, components, utilities;
```

Astryx ships its component CSS in `@layer astryx-base`, and an _unlayered_ rule
outranks every named layer regardless of specificity. `components` sits above
`astryx-base` (a BUI rule may deliberately override an Astryx default) and
below `utilities` (an app-level utility still wins).

The statement is repeated here rather than left to the app because layer
precedence is fixed by **first appearance**, and a later `@layer` statement can
only append names it has not seen — it cannot reorder. `src/index.ts` imports
BUI's stylesheet first, so BUI's CSS is usually the first layered sheet in a
consumer's bundle; without the statement, `components` would register ahead of
`astryx-base` and every Astryx default would win over BUI.

A consumer with its own layer names must therefore declare an **identical**
list (this repo does, in `react/src/index.css`). Two identical statements are
idempotent; two divergent ones silently hand the order to whichever loads
first.

## How to setup relay

> [!NOTE]
> This project contains components related to Relay. Before using these components, please ensure that your project is properly set up with a suitable Relay environment, if necessary, by following the steps below.

1. Set up Relay with a multi-project and configure it so that this project can be compiled.

   ```js
   // relay.config.js or relay.config.json
   module.exports = {
     root: '.',
     sources: {
       'packages/backend.ai-ui': 'backend.ai-ui',
       'your-project-path': 'your-project',
     },
     excludes: ['**/node_modules/**', '**/__mocks__/**', '**/__generated__/**'],
     projects: {
       'backend.ai-ui': {
         language: 'typescript',
         schema: 'schema-path',
         output: 'packages/backend.ai-ui/src/__generated__',
         eagerEsModules: true,
         ...options,
       },
       'your-project': {
         language: 'your language',
         schema: 'schema-path',
         output: 'your-project-path/output-path',
         base: 'backend.ai-ui', // to use backend.ai-ui's fragment
         ...options,
       },
     },
   };
   ```

2. Run the relay-compiler and make sure that the `backend.ai-ui` project compiles successfully.

   ```console
   $ relay-compiler
   ```

3. Depending on the bundler environment, you may need to set up an `alias` for `__generated__`. With the following configuration, relay-compiler will be able to correctly resolve the `__generated__` path.

   ```ts
   // vite.config.ts
   export default defineConfig({
    resolve: {
      alias: {
        // This is used to resolve the __generated__ directory for Relay
        // Since relay uses the directory './__generated__' internally, map this to your-project-path/__generated__.
        './__generated__': resolve(__dirname, 'your-project-path/__generated__'),
    },
   },

   // craco.config.js or webpack.config.js
   resolve: {
    ...webpackConfig.resolve,
      alias: {
        ...webpackConfig.resolve.alias,
        './__generated__': path.resolve(__dirname, 'your-project-path/__generated__'),
      },
   ```

## How to create a component

1. Please create a React component file under `src/components`.
2. Export your component in `src/index.ts`.
   ```ts
   // index.ts
   export { default as YourComponent } from './components/YourComponent';
   ```
3. You can use your component in your project by importing it.
   ```tsx
   // in your project
   import { YourComponent } from 'backend.ai-ui';
   ```
4. If you’ve created a fragment component, you need to spread it into the parent component and pass it as a prop.

   ```tsx
   // relay component in backendai-ui
   import { FragmentComponent$key } from '../__generated__/FragmentComponent.graphql';
   import { useFragment, graphql } from 'react-relay';

   export interface RelayComponentProps {
     fragment: RelayComponent$key;
   }
   const FragmentComponent = ({ fragment }: FragmentComponentProps) => {
    ...
     const data = useFragment(
        graphql`
            fragment FragmentComponent on AnyNode {
                ...fields
            }
        `,
        fragment,
     )
   };
   ```

   ```tsx
   // in your project
   import { FragmentComponent } from 'backend.ai-ui';

   const ParentComponent = () => {
     const { data } = useQueryLoader(
       graphql`
            query ParentComponentQuery {
                ...fields
                node {
                    ...FragmentComponent // spread fragment component
                }
            }
        `,
     );

     return <FragmentComponent fragment={data.node} />;
   };
   ```

## How to build

### Building a Vite app

```console
$ pnpm run build
```

### Building a Storybook

```console
$ pnpm run build-storybook
```

## How to test

> [!NOTE]
> Currently, Relay-related components cannot be tested independently within this project due to their dependency on the Relay environment and GraphQL schema. To test these components, please import them into the main application where the Relay environment is properly configured, and test them there.

Components that are not related to Relay can be tested using Storybook.

1. Please write Storybook stories for the components you develop in the `src/components` directory, using the `component-name.stories.tsx` format.
2. Please run Storybook and go to [http://localhost:6006](http://localhost:6006).
   ```console
   $ pnpm run storybook
   ```

## Localization

A host selects the language by handing `BAIConfigProvider` a `BAILocale`.
The per-language modules under `backend.ai-ui/locale/*` (`en_US`, `ko_KR`, …)
each export one; load only the one you need:

```tsx
import { BAIConfigProvider, type BAILocale } from 'backend.ai-ui';
import en_US from 'backend.ai-ui/locale/en_US';

// Non-English modules are best loaded on demand:
// const { default: ko_KR } = await import('backend.ai-ui/locale/ko_KR');

const App = ({ children }) => (
  // please use BAIConfigProvider at the top-level root
  <BAIConfigProvider locale={en_US}>{children}</BAIConfigProvider>
);
```

A non-English module (`import ko_KR from 'backend.ai-ui/locale/ko_KR'` gives
`{ lang, astryxLocale }`, the Astryx chrome strings for that language) also
registers its `dayjs` locale and starts loading BUI's catalog for that
language. `BAIConfigProvider` suspends until that catalog is in, so mount it
under a `<Suspense>` boundary. These modules used to live at
`backend.ai-ui/dist/locale/*` and carry antd bundles in `BAILocale.antdLocale`;
that field is gone.

### How many i18n runtimes are there? (P13)

Two catalogs, one language.

- **BUI's own i18next instance** (`src/locale/index.ts`) holds BUI's strings.
  It is deliberately separate from the host's instance — `useBAIi18n` and
  `<BAITrans>` bind to it explicitly rather than through React context, so BUI
  resolves its own keys no matter what i18n stack (or none) the host runs
  (FR-2986). Only `en.json` is bundled; every other `src/locale/<lang>.json`
  is a lazy chunk the instance loads when that language is requested.
- **Astryx's resolver** (`@lablup/ui-common/i18n`) holds the strings baked
  into Astryx and ui-common components. It takes a locale plus sparse
  per-locale `overrides`. Each non-English `src/locale/<lang>_<REGION>.ts`
  module merges ui-common's `uic.*` strings for its language
  (`withUiCommonMessages`) under BUI's `@astryx.*` overrides from
  `src/locale/astryx/<lang>.json` into `BAILocale.astryxLocale`. `en_US` has
  none: both libraries fall back to their shipped English.

`BAIConfigProvider` is the single place a language change lands. It drives
`buiI18n.changeLanguage`, `dayjs.locale` **and** Astryx's
`InternationalizationProvider` from the one `locale.lang` prop.

To translate an Astryx string, add its key to the language's
`src/locale/astryx/<lang>.json`. Keys you do not override fall through to
Astryx's shipped English.

### Adding i18n strings

In `backend.ai-ui`, keys are separated and used at the component level. If you want to add a key that will be used in multiple places, please add it to `common`.

```json
// en.json or {country_code}.json
{
  "MyComponent": {
    "translatedText": "translatedText"
  }
}
```

### VSCode Extension for i18n

To improve the development environment, we are using [i18n-ally](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally). Below are the configurations related to this extension.

```json
// backend.ai-ui/.vscode/settings.json
{
  "i18n-ally.localesPaths": ["src/locale"],
  "i18n-ally.enabledFrameworks": ["react"],
  "i18n-ally.keystyle": "nested"
}
```

If you want to develop alongside the webui project, please use the `backend.ai-webui.code-workspace` file to take advantage of VSCode’s [Multi-root Workspaces](https://code.visualstudio.com/docs/editing/workspaces/multi-root-workspaces) feature.
