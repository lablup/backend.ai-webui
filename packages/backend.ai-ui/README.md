# backend.ai-ui

This is a React component project for WebUI.

## Package contract

What a consumer must provide, and what it must import. Everything in this
section was (re)defined by the Astryx migration, ticket 30.

### Peer dependencies

The design-system contract is **Astryx**:

| Peer                                        | Required?             | Why                                                                 |
| ------------------------------------------- | --------------------- | ------------------------------------------------------------------- |
| `@astryxdesign/core`                        | yes                   | Every component BUI renders. Must be a **single** copy — see below. |
| `@astryxdesign/theme-neutral`               | yes                   | The token set `theme-shim` resolves `useToken()` against.           |
| `react` / `react-dom`                       | yes                   | —                                                                   |
| `react-relay` / `relay-runtime` / `graphql` | yes                   | The `fragments/` components are Relay-bound.                        |
| `@tanstack/react-query`                     | yes                   | `BAIConfigProvider` owns the QueryClient.                           |
| `react-router-dom`                          | yes                   | `BAILink` and friends.                                              |

`@astryxdesign/core` and `@astryxdesign/theme-neutral` are peers, **not**
dependencies and **not** bundled. They were `devDependencies` until ticket 30,
which meant `rollupOptions.external` (derived from `peerDependencies`) did not
cover them and BUI's `dist` carried its own inlined copy of Astryx. Two copies
means two StyleX registries and two React contexts: a `<Theme>` mounted by the
app would not be seen by BUI's components, and vice versa. If you ever see
theme values diverge between app-level and BUI-level components, check for a
duplicated `@astryxdesign/core` first.

### There is no antd surface any more

BUI has **no antd in its source, its peers, or its types**. The last of it went
in the to-astryx final switch, which removed the antd `ConfigProvider` leg of
`BAIConfigProvider` and, with it, the 21 `src/locale/*_*.ts` modules that
existed only to hand antd's `Locale` bundles to that provider (they were also
the `backend.ai-ui/dist/locale/*` package export — that export is gone too, see
"Localization" below).

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
  `theme.useToken()` returns) and `antd/es/locale`'s `Locale` — are now
  `src/theme-shim/tokenType.ts`, a frozen capture of antd 6.5.0's token shape,
  and a `BAILocale` that carries only `lang`.

One antd-family package remains, in `devDependencies` only:
`@ant-design/colors`, which `src/theme-shim/themeShim.test.ts` uses as the
reference implementation its vendored port (`theme-shim/vendor/antdColors.ts`)
is asserted bit-identical to. It ships in nothing and is invisible to the
production dependency graph — the workspace's exact-pinned `pnpm-lock.yaml` is what keeps it that way.

### CSS

BUI owns one stylesheet, `src/styles/backend.ai-ui.css`, exported as:

```ts
import 'backend.ai-ui/styles.css';
```

`src/index.ts` imports it too, so consumers that bundle BUI **from source**
(this repo's `react/` app does — see the `backend.ai-ui` → `src` alias in
`react/vite.config.ts`) get it through the module graph and need no explicit
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
@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;
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

BUI's own catalogs live in `src/locale/*.json` and are bundled into the
package's single entry. A host selects the language by handing
`BAIConfigProvider` a `BAILocale` — which is just the language code:

```tsx
import { BAIConfigProvider, type BAILocale } from 'backend.ai-ui';

const locale: BAILocale = { lang: 'en' };

const App = ({ children }) => {
  // please use BAIConfigProvider at the top-level root
  return <BAIConfigProvider locale={locale}>{children}</BAIConfigProvider>;
};
```

> Until the to-astryx final switch this was `import en_US from
> 'backend.ai-ui/dist/locale/en_US'`, one of 21 published per-language modules.
> Each carried an `antd/es/locale/*` bundle in `BAILocale.antdLocale`, whose
> only consumer was antd `ConfigProvider`'s `locale` prop. With that provider
> gone the modules, the `./dist/locale/*` package export and the field were all
> removed rather than left as dead surface.

### How many i18n runtimes are there? (P13)

Two catalogs, one language.

- **BUI's own i18next instance** (`src/locale/index.ts`) holds BUI's strings.
  It is deliberately separate from the host's instance — `useBAIi18n` and
  `<BAITrans>` bind to it explicitly rather than through React context, so BUI
  resolves its own keys no matter what i18n stack (or none) the host runs.
  That is FR-2986 and it stays.
- **Astryx's resolver** (`@astryxdesign/core/i18n`) holds the strings baked
  into Astryx components. It is not configurable as a catalog you own; it
  takes a locale plus sparse per-locale `overrides`.

`BAIConfigProvider` is the single place a language change lands. It drives
`buiI18n.changeLanguage`, `dayjs.locale` **and** Astryx's
`InternationalizationProvider` from the one `locale.lang` prop. Before ticket
30 the third one was missing entirely, so Astryx components formatted their
plurals, numbers and dates as `en` in every non-English session.

To translate an Astryx string, add its key under an `astryx` object in the
matching BUI locale JSON — no new catalog, no host change:

```json
// src/locale/ko.json
{
  "astryx": {
    "@astryx.pagination.next": "다음 페이지로 이동"
  }
}
```

Keys you do not override fall through to Astryx's shipped English, so the
subtree can stay empty and grow one key at a time. See
`src/locale/astryxOverrides.ts`.

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
