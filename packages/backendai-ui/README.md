# backend.ai-ui

This is a react component project for WebUI.

## How to setup relay

> [!NOTE]
> This project contains components related to Relay. Before using these components, please ensure that your project is properly set up with a suitable Relay environment, if necessary, by following the steps below.

1. Set up Relay as a multi-project and configure it so that this project can be compiled.

   ```js
   // relay.config.js or relay.config.json
   module.exports = {
     root: '.',
     sources: {
       'packages/backendai-ui': 'backendai-ui',
       'your-project-path': 'your-project',
     },
     excludes: ['**/node_modules/**', '**/__mocks__/**', '**/__generated__/**'],
     projects: {
       'backendai-ui': {
         language: 'typescript',
         schema: 'schema-path',
         output: 'packages/backendai-ui/src/__generated__',
         eagerEsModules: true,
         ...options,
       },
       'your-project': {
         language: 'your language',
         schema: 'schema-path',
         output: 'your-project-path/output-path',
         base: 'backendai-ui', // to use backendai-ui's fragment
         ...options,
       },
     },
   };
   ```

2. Run the relay-compiler and make sure that the `backendai-ui` project compiles successfully.

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
        // Since relay uses the directory './__generated__' internally, change this to your-project-path/__generated__.
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

1. Please create a react component file under `src/components`.
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

   // import what you need

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

### Building a vite app

```console
$ pnpm run build
```

### Building a storybook

```console
$ pnpm run build-storybook
```

## How to test

> [!NOTE]
> Currently, we can’t test Relay-related components independently within this project. Please import and run the components from the host app.

Components that are not related to Relay can be tested using Storybook.

1. Please write Storybook stories for the components you develop in the `src/components` directory, using the `component-name.stories.tsx` format.
2. Please run storybook and go to [http://localhost:6006](http://localhost:6006).
   ```console
   $ pnpm run storybook
   ```
