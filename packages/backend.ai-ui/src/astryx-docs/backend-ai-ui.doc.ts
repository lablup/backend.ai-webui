import type { ReferenceDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'generic',
  name: 'backend-ai-ui',
  title: 'Backend.AI UI (BUI)',
  description:
    'The BAI* component layer this repository builds on top of Astryx, and when to reach past it.',
  category: 'guide',
  sections: [
    {
      title: 'Overview',
      content: [
        {
          type: 'prose',
          text: 'backend.ai-ui (BUI) is the workspace package that owns every reusable BAI* component. It wraps Astryx primitives with the Backend.AI design-system defaults, its own i18next instance, and the app-shim that replaced antd. Components import from the package root: `import { BAICard, BAIFlex } from "backend.ai-ui";`.',
        },
        {
          type: 'prose',
          text: 'BUI is registered as an Astryx CLI integration, so `astryx component <Name>`, `astryx search`, and `astryx component --list` answer with BAI* components alongside Astryx core. When both could serve, the BAI* one wins — it carries the project defaults that a bare Astryx primitive does not.',
        },
        {
          type: 'prose',
          text: 'One caveat while reading those answers: the **Import** line `astryx component <Name>` prints for a BUI component says `@astryxdesign/core`. That is an upstream CLI 0.5.0 bug — the human renderer recomputes the specifier against core instead of using the resolved one — and it is cosmetic. Every BAI* component imports from `backend.ai-ui`, which is what `astryx search` and `--json` correctly report.',
        },
        {
          type: 'list',
          style: 'do',
          items: [
            'Search before writing UI: `astryx search "<thing>"` lists core and BUI together.',
            'Read the BAI* doc first — it names the Astryx component it wraps and what it adds.',
            'Add reusable components to BUI, not to react/src (see "Where a component lives").',
          ],
        },
      ],
    },
    {
      title: 'Choosing between a BAI wrapper and an Astryx primitive',
      content: [
        {
          type: 'prose',
          text: 'A BAI wrapper exists when the project needs a behavior or default the Astryx primitive does not provide. Reaching past the wrapper to the primitive loses that default silently — the UI still renders, it just stops matching every other screen.',
        },
        {
          type: 'table',
          headers: ['Instead of', 'Use', 'Because'],
          rows: [
            [
              'Card',
              'BAICard',
              'No header divider, status border colors, standardized title/extra layout.',
            ],
            [
              'Button (async onClick)',
              'BAIButton with `action`',
              'Drives the pending state from the returned promise.',
            ],
            [
              'a raw layout element',
              'BAIFlex',
              'The project has no raw <div> layout; BAIFlex carries the gap/align vocabulary.',
            ],
            [
              'Popover + buttons',
              'BAIPopconfirm',
              'The anchored confirm tier, with the danger styling and promise-aware confirm.',
            ],
          ],
        },
      ],
    },
    {
      title: 'Destructive confirmation tiers',
      content: [
        {
          type: 'prose',
          text: 'Ask: if the user clicks OK by accident, can they recover the state in under 30 seconds without contacting support? No means the action is irreversible and needs a typed confirmation.',
        },
        {
          type: 'table',
          headers: ['Tier', 'Component'],
          rows: [
            [
              'Irreversible (delete, purge, force-terminate)',
              'BAIDeleteConfirmModal with `requireConfirmInput`',
            ],
            ['Reversible, anchored', 'BAIPopconfirm'],
            [
              'Reversible, inside a table row',
              "BAINameActionCell action's `popConfirm`",
            ],
            [
              'Reversible, imperative',
              'App.useApp().modal.confirm() from the app-shim',
            ],
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Confirm a permanent deletion with an anchored popover, even when the server also guards it.',
            'Hand-roll a modal with a text input — BAIDeleteConfirmModal is the shared one.',
          ],
        },
      ],
    },
    {
      title: 'Translations',
      content: [
        {
          type: 'prose',
          text: "BUI components bind to BUI's own i18next instance. Use `useBAIi18n()` / `<BAITrans>` inside packages/backend.ai-ui/src, with keys in packages/backend.ai-ui/src/locale/. Importing `useTranslation` / `Trans` from react-i18next inside BUI is blocked by ESLint — those belong to host components under react/src.",
        },
      ],
    },
    {
      title: 'Where a component lives',
      content: [
        {
          type: 'prose',
          text: 'BUI is the single home for reusable BAI* components. A component stays under react/src only when it genuinely depends on host-app context — the host router, host jotai state, or host resources/i18n keys that would make no sense in a library. Relay is not a reason to stay host-side: BUI has its own Relay project and host queries can spread BUI fragments.',
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Fork a BUI component host-side to add a capability — add the capability to the BUI component.',
          ],
        },
      ],
    },
    {
      title: 'Documenting a component',
      content: [
        {
          type: 'prose',
          text: "A BAI* component becomes visible to this CLI when it ships a same-stem doc file next to its source: `BAICard.tsx` and `BAICard.doc.ts`. The doc must export a `docs` constant — the CLI's component loader reads the named export, so a default-only file loads as undefined — and re-export it as default to match the documented authoring shape.",
        },
        {
          type: 'code',
          lang: 'ts',
          label: 'BAICard.doc.ts',
          code: [
            "import type { ComponentDoc } from '@astryxdesign/cli/authoring';",
            '',
            'export const docs = {',
            "  type: 'component',",
            "  name: 'BAICard',",
            "  displayName: 'BAI Card',",
            "  category: 'Container',",
            "  keywords: ['card', 'panel', 'surface'],",
            "  usage: { description: 'What it is, and when to use it instead of the primitive.' },",
            "  props: [{ name: 'title', type: 'ReactNode', description: 'Header title.' }],",
            '} satisfies ComponentDoc;',
            '',
            'export default docs;',
          ].join('\n'),
        },
        {
          type: 'prose',
          text: 'Doc files sit inside src/ on purpose: `tsc --noEmit` type-checks them against ComponentDoc, so a prop list that drifts from the component fails the same harness as the rest of the code. They are excluded from the published dist.',
        },
        {
          type: 'prose',
          text: 'One doc per component FILE — discovery keys a component on the doc file\'s stem, so a file that exports several components (BAISelect and its option markers, BAIMetadataList and its item) documents them under `components: [...]` instead of `props`. Such a doc must OMIT the `type: "component"` stamp: the stamped schema requires a top-level `props` array and has no multi-component variant, so a stamped multi doc fails validation while an unstamped one is shape-sniffed and accepted.',
        },
      ],
    },
  ],
} satisfies ReferenceDoc;

export default docs;
