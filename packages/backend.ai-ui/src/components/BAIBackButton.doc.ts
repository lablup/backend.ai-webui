import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIBackButton',
  displayName: 'BAI Back Button',
  category: 'Navigation',
  keywords: [
    'back',
    'navigate',
    'router',
    'breadcrumb',
    'return',
    'previous',
    'arrow',
  ],
  usage: {
    description:
      'The "go back" affordance for a detail or wizard page. It renders an Astryx `IconButton` with `variant="ghost"` and a lucide `ArrowLeft`, and on click calls react-router\'s `navigate(to, options)` — so it moves to a declared destination rather than popping browser history, which keeps the target stable however the user arrived. The accessible name and the hover tooltip both come from the translated `general.button.Back` string via `useBAIi18n()`, so the control announces itself without the caller passing any label.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Point `to` at the list or parent page this view belongs to, so the destination is the same whether the user arrived by link, by deep link, or by a redirect.',
      },
      {
        guidance: true,
        description:
          'Place it at the start of the page title row, left of the heading, which is where every detail page in the app puts it.',
      },
      {
        guidance: true,
        description:
          'Pass `options` with `replace: true` when going back should collapse a step rather than add another history entry, as in a multi-step form.',
      },
      {
        guidance: false,
        description:
          'Wrap it in a tooltip or add an `aria-label` alongside it — it already carries both, and a second one produces a duplicated announcement.',
      },
      {
        guidance: false,
        description:
          'Render it outside a react-router context; `useNavigate()` throws there.',
      },
    ],
  },
  props: [
    {
      name: 'to',
      type: 'To',
      description:
        'react-router destination — a path string or a partial location object. Handed straight to `navigate()`, so relative paths resolve against the current route.',
      required: true,
    },
    {
      name: 'options',
      type: 'NavigateOptions',
      description:
        "react-router navigation options such as `replace`, `state` and `preventScrollReset`, forwarded as `navigate()`'s second argument.",
    },
  ],
  examples: [
    {
      label: 'Back to the parent list',
      code: `{currentStep !== 'resource-group' && <BAIBackButton to={navigateTo} />}`,
    },
    {
      label: 'Replacing the current history entry',
      code: `<BAIBackButton to="/session" options={{ replace: true }} />`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
