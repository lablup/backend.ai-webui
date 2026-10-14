import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIEntitySharePermissionSelector',
  displayName: 'BAI Entity Share Permission Selector',
  category: 'Data Input',
  keywords: [
    'permission',
    'permission bit',
    'PermissionBit',
    'entity share',
    'createEntityShare',
    'share',
    'invite',
    'folder share',
    'full access',
    'read only',
    'read write',
    'custom',
    'dropdown menu',
    'submenu',
  ],
  usage: {
    description:
      'The selector for the permission cap an entity share carries — the `permissions` list of PermissionBits that `createEntityShare` takes (managers >= 26.9.0). It is a DropdownMenu in compound mode wrapped in an Astryx Field: the trigger reads the current preset name, the menu lists the three presets as radio rows (Full access, Read & write, Read only), then a divider, then a Custom submenu whose flyout — opened on hover, Right arrow or click like Figma\'s share menu — holds one checkbox per bit (Create, Read, Update, Soft delete, Hard delete, each tagged with its C / R / U / Soft-D / Hard-D code). The value is always the bit list: a preset commits its fixed set and closes the menu, a checkbox commits exactly the checked bits and keeps the flyout open, and the preset is derived back from the bits, so the trigger reads "Custom" only when they match no preset. Unchecking the last checked bit is blocked, because an empty list means "no ceiling" on the server. The mount permission (the NONE / READ_ONLY / READ_WRITE vfolder mount policy) is a separate axis with its own selector; this component covers the share bits only. The rest of FieldProps passes through — label (required), isLabelHidden, description, status, width, isDisabled.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass the bits straight into the mutation input (`input.permissions`); they come back in flyout order with duplicates dropped, so no normalizer is needed.',
      },
      {
        guidance: true,
        description:
          'Start it from the preset that matches what the user already chose elsewhere — a read-only mount level maps to READ_ONLY, a read-write one to READ_WRITE — and leave the two axes independent after that.',
      },
      {
        guidance: true,
        description:
          'Show a share\'s stored cap with `useEntitySharePermissionLabels().summary(bits)`, so a table cell reads the same words as the menu ("Read only", or "C, R, U" for a custom set).',
      },
      {
        guidance: true,
        description:
          'Keep `label` a real string on every instance and add `isLabelHidden` inside a form item or a table cell; it is the accessible name of the trigger.',
      },
      {
        guidance: false,
        description:
          'Use it for the mount permission or for RBAC role permissions. The first is a three-level mount policy with its own Selector; the second is a per-entity-type grid (RBACPermissionGrid), not one cap.',
      },
      {
        guidance: false,
        description:
          'Read the preset back from the trigger text or keep a preset in state: derive it with `toEntitySharePermissionChoice(bits)` from the bits you already hold.',
      },
    ],
  },
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name of the trigger and the visible field label. Required by the Astryx Field.',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Hides the rendered label while keeping the accessible name.',
    },
    {
      name: 'value',
      type: 'ReadonlyArray<BAIEntitySharePermissionBit>',
      description:
        'The bits the share is capped at (`CREATE`, `READ`, `UPDATE`, `SOFT_DELETE`, `HARD_DELETE`). Omit it and the selector keeps the bits itself.',
    },
    {
      name: 'defaultValue',
      type: 'ReadonlyArray<BAIEntitySharePermissionBit>',
      description: 'Initial bits when `value` is not controlled.',
      default: "['READ']",
    },
    {
      name: 'onChange',
      type: '(bits: Array<BAIEntitySharePermissionBit>, choice: BAIEntitySharePermissionChoice) => void',
      description:
        'Fired with the new bits in flyout order and the preset they match — `FULL_ACCESS`, `READ_WRITE`, `READ_ONLY` — or `CUSTOM`.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Blocks the trigger and dims the field label.',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Helper text rendered between the label and the trigger.',
    },
    {
      name: 'status',
      type: "{ type: 'warning' | 'error' | 'success'; message?: string }",
      description: 'Validation state on the field, such as an error message.',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        'Width of the whole field; the trigger fills it. Left unset, the field sizes to its content.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Trigger height, in the Astryx Button size vocabulary.',
      default: "'md'",
    },
    {
      name: 'variant',
      type: "'secondary' | 'ghost'",
      description:
        "Trigger style: `'secondary'` is the bordered form treatment, `'ghost'` matches toolbar buttons.",
      default: "'secondary'",
    },
    {
      name: 'placement',
      type: "'above' | 'below' | 'start' | 'end'",
      description: 'Menu placement relative to the trigger.',
      default: "'below'",
    },
    {
      name: 'alignment',
      type: "'start' | 'center' | 'end'",
      description: 'Menu alignment along the placement axis.',
      default: "'start'",
    },
    {
      name: 'menuWidth',
      type: 'number | string',
      description:
        'Minimum width of the menu. Left unset, it matches the trigger width and grows for its content.',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: 'Reports the menu opening and closing.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description:
        'Test hook on the trigger. The rows carry fixed ids: `bai-entity-share-permission-<full-access|read-write|read-only>`, `-custom` and `-bit-<create|read|update|soft-delete|hard-delete>`.',
    },
  ],
  examples: [
    {
      label: 'Invite row: the cap sent with createEntityShare',
      code: `const [permissionBits, setPermissionBits] = useState<
  Array<BAIEntitySharePermissionBit>
>(['READ']);

<BAIEntitySharePermissionSelector
  label={t('data.folders.SharePermission')}
  width={170}
  value={permissionBits}
  onChange={(bits) => setPermissionBits(bits)}
/>

await createShare({
  input: {
    targetEntityType: 'vfolder',
    targetEntityId: vfolderId,
    recipient: { userId },
    permissions: permissionBits,
  },
});`,
    },
    {
      label: "A stored cap in a table cell, in the menu's own words",
      code: `const { summary } = useEntitySharePermissionLabels();

{
  title: t('data.folders.SharePermission'),
  dataIndex: 'permissions',
  render: (bits: ReadonlyArray<string>) => <Token label={summary(bits)} />,
}`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
