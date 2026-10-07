import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIFormItem',
  displayName: 'BAI Form Item',
  category: 'Form Controls',
  keywords: ['form item', 'field', 'label', 'label action', 'labelExtra'],
  usage: {
    description:
      "The form engine's `Form.Item` (`@lablup/ui-common/Form`) plus a `labelExtra` slot for actions that belong to the field's label row. Every other prop passes through to `Form.Item`.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Put field-scoped actions such as a filter or sort toggle in `labelExtra` instead of hand-building a flex row inside `label`.',
      },
      {
        guidance: false,
        description:
          'Put long text in `labelExtra`; the slot never shrinks, so the label text is what clips in a narrow column.',
      },
    ],
  },
  props: [
    {
      name: 'labelExtra',
      type: 'ReactNode',
      description:
        'Actions for the label row: at the far end of the row in vertical layout, right after the label text otherwise. Ignored without a `label`.',
    },
  ],
  examples: [
    {
      label: 'A filter menu at the end of the label row',
      code: `<BAIFormItem
  name={['environments', 'environment']}
  label={t('session.launcher.Environments')}
  labelExtra={
    <DropdownMenu
      button={{ label: t('session.launcher.ImageFilter'), icon: <ArrowUpDown size="1em" />, isIconOnly: true, variant: 'ghost', size: 'sm' }}
      hasChevron={false}
      alignment="end"
    >
      <DropdownMenuCheckboxItem label={t('session.launcher.ShowAcceleratorDedicatedImagesFirst')} value={showDedicatedFirst} onChange={setShowDedicatedFirst} />
    </DropdownMenu>
  }
>
  <BAISelect />
</BAIFormItem>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
