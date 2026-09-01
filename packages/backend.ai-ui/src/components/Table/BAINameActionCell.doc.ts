import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAINameActionCell',
  displayName: 'BAI Name Action Cell',
  category: 'Table & List',
  keywords: [
    'table',
    'cell',
    'row actions',
    'name column',
    'overflow menu',
    'kebab menu',
    'popconfirm',
  ],
  usage: {
    description:
      'The name column of a table row: an optional leading icon, the row title (plain text, a react-router link via `to`, or a click handler via `onTitleClick`), and a set of row actions on the right. The actions render as small icon buttons and collapse into an Astryx DropdownMenu (…) as the column narrows — a ResizeObserver measures the cell and moves the ones that no longer fit into the menu, so a narrow table never clips its actions. An action carrying `popConfirm` is gated by an anchored Astryx Popover confirm while it is a visible button, and falls back to `modal.confirm` with the same copy once it overflows into the menu.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Place it in the first (name) column of a BAITable so every row exposes its actions in one predictable spot instead of a separate actions column.',
      },
      {
        guidance: true,
        description:
          'Reserve `popConfirm` for reversible actions such as deactivating or unassigning; permanent deletion should open BAIDeleteConfirmModal with requireConfirmInput from an `onClick` instead.',
      },
      {
        guidance: true,
        description:
          'Pair `disabled` with `disabledReason` — the reason becomes the button tooltip and is appended to the label once the action overflows into the more menu.',
      },
      {
        guidance: true,
        description:
          'Set `minVisibleActions` when an action must never hide, and `showInMenu: "always"` for secondary actions that should only ever live in the more menu.',
      },
      {
        guidance: false,
        description:
          'Add a parallel actions column beside this cell — the overflow measurement assumes the actions share the cell with the title.',
      },
      {
        guidance: false,
        description:
          'Give one action both `onClick`/`action` and `popConfirm`; in the overflow menu the handler wins and the confirmation is skipped.',
      },
    ],
  },
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description:
        'Row title. A string title is what `copyable` copies and what the ellipsis tooltip shows.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Icon rendered before the title. Its measured width is reserved before the action buttons are laid out.',
    },
    {
      name: 'to',
      type: "LinkProps['to']",
      description:
        'Renders the title as a react-router link to this path. Takes precedence over `onTitleClick`.',
    },
    {
      name: 'onTitleClick',
      type: '(e: React.MouseEvent) => void',
      description:
        'Makes the title clickable without navigating. Used only when `to` is absent.',
    },
    {
      name: 'actions',
      type: 'BAINameActionCellAction[]',
      description:
        'Row actions. Each entry takes `key`, `title`, `icon`, `onClick` or async `action`, `type: "default" | "danger"`, `disabled` with `disabledReason`, `showInMenu`, and `popConfirm`.',
    },
    {
      name: 'showActions',
      type: "'hover' | 'always'",
      description:
        'Whether the action area appears on row hover or stays visible. `always` reserves title width for the buttons, so fewer of them fit before overflowing.',
      default: "'hover'",
    },
    {
      name: 'minVisibleActions',
      type: 'number',
      description:
        'Lower bound on how many action buttons stay outside the more menu, even when the cell is too narrow for them.',
      default: '0',
    },
    {
      name: 'moreMenuDisabled',
      type: 'boolean',
      description:
        'Disables the overflow (…) trigger. Actions that live in the menu stay listed but become unreachable.',
    },
    {
      name: 'copyable',
      type: 'boolean',
      description:
        'Shows a copy-to-clipboard control next to the title. Copies the title only when it is a string.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description: 'Inline style applied to the cell wrapper.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Extra class names merged onto the cell wrapper.',
    },
  ],
  examples: [
    {
      label: 'Name cell with row actions',
      code: `<BAINameActionCell
  title={record.user_id}
  showActions="always"
  actions={actions}
/>`,
    },
    {
      label: 'Reversible action behind a confirm',
      code: `const actions = [
  {
    key: 'deactivate',
    title: t('credential.Deactivate'),
    icon: <BanIcon />,
    type: 'danger' as const,
    popConfirm: {
      title: t('credential.DeactivateCredential'),
      description: record.user_id,
      okButtonProps: { danger: true },
      onConfirm: () => deactivate(record.access_key),
    },
  },
];`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
