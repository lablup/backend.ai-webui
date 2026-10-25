import type { ComponentDoc } from '@astryxdesign/cli/authoring';

const control = (name: string, uiCommon: string, description: string) => ({
  name,
  displayName: `BAI ${name.slice(3).replace(/([a-z])([A-Z])/g, '$1 $2')}`,
  description: `ui-common \`${uiCommon}\`, re-exported unchanged. ${description} Props: \`ui-common component ${uiCommon}\`.`,
});

// Unstamped: the stamped component schema has no multi-component variant.
export const docs = {
  name: 'BAIFormControls',
  displayName: 'BAI Form Controls',
  category: 'Data Input',
  keywords: [
    'form',
    'form item',
    'input',
    'text input',
    'number input',
    'select',
    'selector',
    'switch',
    'checkbox',
    'radio',
    'tags',
    'date',
  ],
  usage: {
    description:
      "ui-common's Form.Item-aware form controls under BAI* names. Each is the ui-common component itself, not a wrapper: inside a Form.Item it takes value, onChange, disabled, status and its accessible name from the item, fills the item row, and keeps its Astryx props. webui imports these names from backend.ai-ui instead of the ui-common subpaths (ADR 0014).",
    bestPractices: [
      {
        guidance: true,
        description:
          'Put the control directly inside a Form.Item; the item owns the visible label, rules, help and extra.',
      },
      {
        guidance: true,
        description:
          'Pass aria-label only where there is no Form.Item label to name the control (a row field, a toolbar).',
      },
      {
        guidance: true,
        description: 'Give a checkbox or switch its visible text as children.',
      },
      {
        guidance: false,
        description:
          'Wrap the control in another element inside a Form.Item: the item clones its direct child, so the wrapper takes the value and onChange.',
      },
      {
        guidance: false,
        description:
          'Add behaviour here. A control that needs a BUI-specific behaviour becomes its own BAI* component file.',
      },
    ],
  },
  components: [
    control('BAITextInput', 'TextInput', 'Single-line text.'),
    control('BAITextArea', 'TextArea', 'Multi-line text.'),
    control(
      'BAINumberInput',
      'NumberInput',
      'A number; an emptied field reports null while hasClear is true (the default).',
    ),
    control('BAISwitch', 'Switch', 'An on/off toggle.'),
    control('BAICheckboxInput', 'CheckboxInput', 'A single checkbox.'),
    control('BAICheckboxList', 'CheckboxList', 'A group of checkboxes.'),
    control(
      'BAICheckboxListItem',
      'CheckboxListItem',
      'One option of BAICheckboxList.',
    ),
    control(
      'BAISelector',
      'Selector',
      'A single choice from a static option list; opens below the trigger.',
    ),
    control(
      'BAIMultiSelector',
      'MultiSelector',
      'Several choices from a static option list; the trigger names the selection.',
    ),
    control(
      'BAITagsInput',
      'TagsInput',
      'Free-form tags as a string array, split on tokenSeparators.',
    ),
    control('BAIRadioList', 'RadioList', 'A single choice shown as radios.'),
    control('BAIRadioListItem', 'RadioListItem', 'One option of BAIRadioList.'),
    control(
      'BAISegmentedControl',
      'SegmentedControl',
      'A single choice shown as segments; use BAISegmentedControlItem for its options.',
    ),
    control('BAISlider', 'Slider', 'A value or range on a track.'),
    control('BAIDateInput', 'DateInput', 'A date.'),
    control('BAIDateTimeInput', 'DateTimeInput', 'A date and time.'),
    control('BAIDateRangeInput', 'DateRangeInput', 'A date range.'),
    control('BAITimeInput', 'TimeInput', 'A time of day.'),
    control('BAIFileInput', 'FileInput', 'A file picker.'),
    control('BAITokenizer', 'Tokenizer', 'Tokens chosen from a search source.'),
    control(
      'BAITypeahead',
      'Typeahead',
      'One item chosen from a search source.',
    ),
  ],
  examples: [
    {
      label: 'Controls inside Form.Item',
      code: `<Form.Item name="name" label={t('resourcePolicy.Name')} rules={[{ required: true }]}>
  <BAITextInput />
</Form.Item>
<Form.Item name="maxCount" label={t('resourcePolicy.MaxFolderCount')}>
  <BAINumberInput min={0} />
</Form.Item>
<Form.Item name="isActive" valuePropName="checked">
  <BAICheckboxInput>{t('general.Enable')}</BAICheckboxInput>
</Form.Item>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
