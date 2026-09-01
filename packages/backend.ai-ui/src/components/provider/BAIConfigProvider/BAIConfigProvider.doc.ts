import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIConfigProvider',
  displayName: 'BAI Config Provider',
  category: 'Utility',
  keywords: [
    'provider',
    'config',
    'locale',
    'i18n',
    'internationalization',
    'setup',
    'root',
  ],
  usage: {
    description:
      "The root provider every `backend.ai-ui` consumer mounts once, at the top of the app. It wires four things: a shared TanStack `QueryClientProvider` (created at module scope, with `refetchOnWindowFocus` and `retry` disabled), Astryx's `InternationalizationProvider` (locale, `dir` from `getLocaleDirection`, and the `@astryx.*` string overrides carried on `locale.astryxLocale`), BUI's own i18next instance plus the dayjs locale — both re-synced in an effect whenever `locale.lang` changes — and, when the client props are present, `BAIClientProvider`. It deliberately does not render an i18next React Context: BUI components bind to BUI's instance explicitly through `useBAIi18n()`, so the host's own i18n context is left untouched. Its props are standalone — there is no underlying component to pass extra props through to.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Mount exactly one instance at the app root, above the router, so every BUI component in the tree shares one query client and one locale.',
      },
      {
        guidance: true,
        description:
          "Pass a `locale` built from the host's current language together with the matching `backend.ai-ui/locale/*` catalog, so BUI strings, dayjs formatting and Astryx's `IntlMessageFormat` plurals/numbers/dates all follow the session language.",
      },
      {
        guidance: true,
        description:
          'Supply `clientPromise` and `anonymousClientFactory` as a pair — the props type accepts both or neither, and omitting them mounts the children without any Backend.AI client context.',
      },
      {
        guidance: false,
        description:
          "Expect it to configure theming: Astryx theme tokens come from the host's own theme setup, and the antd-era `theme` / `csp` / `modal` / `drawer` / `tag` pass-through props no longer exist.",
      },
      {
        guidance: false,
        description:
          "Rely on it to set the DOM `dir` attribute for a right-to-left language — it only sets the direction Astryx reads from context; `<html dir>` stays the host's responsibility.",
      },
    ],
  },
  props: [
    {
      name: 'locale',
      type: 'BAILocale',
      description:
        "The session language: `lang` drives BUI i18next, dayjs and Astryx, and the optional `astryxLocale` catalog overrides Astryx's built-in chrome strings for that language. Left unset, Astryx falls back to `en` and the other two runtimes keep whatever language they were last set to.",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'The application subtree. Everything that uses BUI components or BUI hooks belongs inside it.',
    },
    {
      name: 'clientPromise',
      type: 'Promise<BAIClient>',
      description:
        'The signed-in Backend.AI client. Providing it together with `anonymousClientFactory` mounts a `BAIClientProvider` around the children; the props type rejects one without the other.',
    },
    {
      name: 'anonymousClientFactory',
      type: '(api_endpoint: string) => BAIClient',
      description:
        'Factory for unauthenticated, endpoint-scoped clients, forwarded to `BAIClientProvider` and read by `useAnonymousBAIClient`. Must be passed alongside `clientPromise`.',
    },
  ],
  examples: [
    {
      label: 'App root with client context',
      code: `<BAIConfigProvider
  locale={currentLocale}
  clientPromise={backendaiClientPromise}
  anonymousClientFactory={createAnonymousBackendaiClient}
>
  <BAIMetaDataProvider
    deviceMetaData={deviceMetaData}
    imageMetaData={imageMetaData}
    imagePath="resources/icons"
  >
    <RouterProvider router={router} />
  </BAIMetaDataProvider>
</BAIConfigProvider>`,
    },
    {
      label: 'Locale only',
      code: `<BAIConfigProvider locale={{ lang: 'ko' }}>
  <StoryComponent />
</BAIConfigProvider>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
