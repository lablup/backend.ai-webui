import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAILink',
  displayName: 'BAI Link',
  category: 'Navigation',
  keywords: [
    'link',
    'anchor',
    'hyperlink',
    'navigate',
    'router link',
    'text button',
  ],
  usage: {
    description:
      'The text link used for in-app navigation, external references and inline text actions. It picks its element from what you pass: with a `to` it renders a react-router `Link`, because Astryx’s own Link is href-first and cannot take a router `To` object; with no `to` (or `type="disabled"`) it renders an Astryx Link, which without an href is a real `<button>` with link styling — the right semantics for the many click-only links that antd rendered as a destination-less anchor. Link visuals are on by default, and `ellipsis` clips the label on the link itself so the tooltip anchors to the element that owns the text. BAILinkProps extends react-router’s LinkProps, so the remaining anchor and router props pass through — except on the Astryx branch, where the router-only props and the legacy `color` attribute are stripped.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Give in-app destinations a `to` so navigation stays inside the router and middle-click or copy-link keeps working.',
      },
      {
        guidance: true,
        description:
          'Leave `type` at its default for anything interactive; a link that does not look like a link is a bug.',
      },
      {
        guidance: true,
        description:
          'Set `ellipsis` on links inside table cells and cards, where a long resource name would otherwise push the row wider.',
      },
      {
        guidance: false,
        description:
          'Pass both a `to` and `type="disabled"` expecting a dead anchor — the disabled state deliberately routes to the Astryx button branch instead.',
      },
      {
        guidance: false,
        description:
          'Wrap the link in a separate ellipsis or tooltip component; an ancestor cannot clip or measure the text box the link owns.',
      },
    ],
  },
  props: [
    {
      name: 'to',
      type: "LinkProps['to']",
      description:
        'react-router destination. Optional here (react-router requires it), and its presence is what selects the router-Link branch.',
    },
    {
      name: 'type',
      type: "'hover' | 'disabled'",
      description:
        'Visual and interaction state. The default carries the accent colour and hover underline; `disabled` renders a non-interactive Astryx Link even when a `to` is given.',
      default: "'hover'",
    },
    {
      name: 'icon',
      type: 'React.ReactNode',
      description:
        'Trailing glyph rendered after the label, typically an external-link or chevron icon.',
    },
    {
      name: 'ellipsis',
      type: 'boolean | { tooltip?: string }',
      description:
        'Clips the label with an ellipsis and caps the link width. `true` shows the full text in a tooltip; the object form supplies custom tooltip copy.',
    },
    {
      name: 'children',
      type: 'string | React.ReactNode',
      description:
        'Link label. Wrapped in BAIText when `ellipsis` is set, so the clip and the tooltip sit on the text itself.',
    },
    {
      name: 'onClick',
      type: 'React.MouseEventHandler<HTMLAnchorElement>',
      description:
        'Click handler. On its own — with no `to` — it is what makes the link a proper button element rather than an empty anchor.',
    },
  ],
  examples: [
    {
      label: 'Router navigation',
      code: `<BAILink type="hover" to={generateFolderPath(toLocalId(vfolder?.id))}>
  {vfolder?.name}
</BAILink>`,
    },
    {
      label: 'Click-only action link',
      code: `<BAILink
  onClick={() => {
    onClose();
    webuiNavigate(buildProjectPath('deployments'));
  }}
>
  {t('data.folders.GoToDeployments')}
</BAILink>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
