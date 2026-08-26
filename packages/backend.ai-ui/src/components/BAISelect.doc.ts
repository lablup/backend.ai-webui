import type { ComponentDoc } from '@astryxdesign/cli/authoring';

// No `type: 'component'` stamp: CLI 0.5.0's stamped component schema requires
// a top-level `props` array and has no multi-component variant, so a stamped
// `components` doc fails validation. Unstamped docs are shape-sniffed and the
// multi form is accepted.
export const docs = {
  name: 'BAISelect',
  displayName: 'BAI Select',
  category: 'Data Input',
  keywords: [
    'select',
    'dropdown',
    'combobox',
    'picker',
    'selector',
    'multiselect',
    'listbox',
  ],
  usage: {
    description:
      'The single-choice and multi-choice select used across Backend.AI forms. It renders Astryx Selector, or MultiSelector when mode is "multiple" or "tags", and adds what those primitives do not carry on their own: ReactNode option labels (the flattened text becomes the accessible name and search key while the original node is restored through renderOption), an accessible name derived from placeholder when no label is given, section headers and footers built on the native option model, a below placement so the popup never covers the trigger, and a labels-first multi-select trigger instead of the "N selected" count. It also accepts the Select.Option / Select.OptGroup children form through BAISelectOptionItem and BAISelectOptionGroup. The prop surface is antd-Select-shaped so the twelve components that extend BAISelectProps keep compiling; several of those props are accepted and inert because Astryx owns the mechanism internally — they are marked below.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass a placeholder on every instance — it is what the accessible name falls back to when label is absent.',
      },
      {
        guidance: true,
        description:
          'Supply options as data and use optionRender for rich rows, so the trigger and the search index keep a plain-text label.',
      },
      {
        guidance: true,
        description:
          'Reach for BAIComplexSelect instead when the list is server-paginated or needs server-side search; Selector filters only the options it already holds.',
      },
      {
        guidance: false,
        description:
          'Rely on filterOption, optionFilterProp, searchAction, endReached, or maxTagCount — they are accepted for source compatibility and have no effect.',
      },
      {
        guidance: false,
        description:
          'Pass a ReactNode as header or footer; only the string form survives, since it becomes a real section title or a trailing disabled option.',
      },
    ],
  },
  components: [
    {
      name: 'BAISelect',
      displayName: 'BAI Select',
      description:
        'The select control itself. Renders Astryx Selector, or MultiSelector in multiple/tags mode.',
      props: [
        {
          name: 'options',
          type: 'Array<OptionType>',
          description:
            'Option data. Each entry carries value, label (string or node), disabled, and any extra keys the call site reads back in optionRender.',
        },
        {
          name: 'value',
          type: 'ValueType',
          description:
            'Controlled selection. An array in multiple/tags mode, a single value otherwise.',
        },
        {
          name: 'defaultValue',
          type: 'ValueType',
          description: 'Initial selection for the uncontrolled case.',
        },
        {
          name: 'onChange',
          type: '(value: any, option?: any) => void',
          description:
            'Fired with the new selection and the matching option data. Also fired once on mount when autoSelectOption resolves a value.',
        },
        {
          name: 'onSelect',
          type: '(value: any, option?: any) => void',
          description: 'Fired when an option is picked, alongside onChange.',
        },
        {
          name: 'placeholder',
          type: 'ReactNode',
          description:
            'Empty-state text on the trigger. Doubles as the accessible name when label is not given.',
        },
        {
          name: 'mode',
          type: "'multiple' | 'tags'",
          description:
            'Switches to MultiSelector. "tags" routes there too, so free entry of values outside the option list is not available — use a Tokenizer for that.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          description: 'Blocks interaction; maps to Astryx isDisabled.',
        },
        {
          name: 'loading',
          type: 'boolean',
          description:
            'Shows the pending state on the trigger; maps to Astryx isLoading.',
        },
        {
          name: 'allowClear',
          type: 'boolean',
          description: 'Adds the clear affordance; maps to Astryx hasClear.',
        },
        {
          name: 'showSearch',
          type: 'boolean | { searchValue?: string; onSearch?: (value: string) => void; filterOption?: boolean | ((input: string, option?: any) => boolean); optionFilterProp?: string }',
          description:
            'Enables the in-popup search box. The object form is accepted, but filterOption and optionFilterProp are inert — Selector filters on the option label it renders.',
        },
        {
          name: 'status',
          type: "'error' | 'warning' | ''",
          description:
            'Validation state on the trigger. "error" maps to the Astryx error status.',
        },
        {
          name: 'size',
          type: "'small' | 'middle' | 'large'",
          description: 'Control height, in the antd sizing vocabulary.',
        },
        {
          name: 'open',
          type: 'boolean',
          description:
            'Accepted and inert — Astryx Selector owns its popup visibility.',
        },
        {
          name: 'onOpenChange',
          type: '(open: boolean) => void',
          description: 'Accepted and inert, for the same reason as open.',
        },
        {
          name: 'optionRender',
          type: '(option: { data: BAISelectOption; label?: ReactNode; value?: string | number | null }) => ReactNode',
          description:
            'Custom option row. Receives the original option data, so a node label can be rebuilt in full inside the popup.',
        },
        {
          name: 'label',
          type: 'string',
          description:
            'Accessible name. Falls back to the flattened placeholder, then to a translated generic.',
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description:
            'Whether the label is visually hidden. Hidden by default, since no call site renders a visible one.',
        },
        {
          name: 'triggerDisplay',
          type: "'count' | 'labels' | 'badges'",
          description:
            'How the closed multi-select trigger summarizes the selection: the first three labels comma-joined plus "+N", a plain count, or Badge chips.',
          default: "'labels'",
        },
        {
          name: 'maxBadges',
          type: 'number',
          description:
            'Badges shown before "+N". Only meaningful with triggerDisplay="badges".',
        },
        {
          name: 'optionLabelProp',
          type: 'string',
          description:
            'Set to "children" to render the selected option’s rich node on the closed trigger. Any other value falls back to the flattened text.',
        },
        {
          name: 'autoSelectOption',
          type: 'boolean | ((options: Array<OptionType> | undefined) => ValueType)',
          description:
            'Selects an option when nothing is chosen — the first one, or the value the function returns — and reports it through onChange.',
        },
        {
          name: 'header',
          type: 'ReactNode',
          description:
            'Leading popup slot. A string becomes a native section title; a node is dropped.',
        },
        {
          name: 'footer',
          type: 'ReactNode',
          description:
            'Trailing popup slot. A string becomes a divider plus a disabled option; a node is dropped.',
        },
        {
          name: 'ghost',
          type: 'boolean',
          description:
            'On-dark treatment for the select that sits on the header’s brand-accent band.',
        },
        {
          name: 'tooltip',
          type: 'string',
          description: 'Hover description for the control.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'The element form of the option list — BAISelectOptionItem and BAISelectOptionGroup. Read only when options is undefined.',
        },
        {
          name: 'className',
          type: 'string',
          description: 'Class applied to the control wrapper.',
        },
        {
          name: 'style',
          type: 'CSSProperties',
          description:
            'Inline style on the wrapper; a width here is forwarded to the Astryx width prop.',
        },
        {
          name: 'autoFocus',
          type: 'boolean',
          description: 'Focuses the trigger on mount.',
        },
        {
          name: 'tabIndex',
          type: 'number',
          description: 'Tab order of the trigger.',
        },
        {
          name: 'notFoundContent',
          type: 'ReactNode',
          description:
            'Accepted and inert — Astryx Selector renders its own empty state.',
        },
        {
          name: 'suffixIcon',
          type: 'ReactNode',
          description:
            'Accepted and inert — the trigger affordance is owned by Astryx.',
        },
        {
          name: 'popupRender',
          type: '(menu: ReactNode) => ReactNode',
          description:
            'Accepted and inert — there is no arbitrary popup-body escape hatch; use header and footer.',
        },
        {
          name: 'popupMatchSelectWidth',
          type: 'boolean | number',
          description: 'Accepted and inert — popup sizing is owned by Astryx.',
        },
        {
          name: 'maxTagCount',
          type: "number | 'responsive'",
          description:
            'Accepted and inert — the multi-select overflow policy is fixed at three labels then "+N".',
        },
        {
          name: 'maxTagPlaceholder',
          type: 'ReactNode | ((omitted: Array<any>) => ReactNode)',
          description: 'Accepted and inert, alongside maxTagCount.',
        },
        {
          name: 'labelRender',
          type: '(props: any) => ReactNode',
          description:
            'Accepted and inert — use optionLabelProp="children" for a rich trigger label.',
        },
        {
          name: 'searchAction',
          type: '(value: string) => Promise<void>',
          description:
            'Accepted and inert — server-driven search belongs to BAIComplexSelect, not Selector.',
        },
        {
          name: 'endReached',
          type: '() => void',
          description:
            'Accepted and inert — Astryx owns the popup and emits no scroll event. Paginated lists use BAIComplexSelect.',
        },
        {
          name: 'atBottomStateChange',
          type: '(atBottom: boolean) => void',
          description: 'Accepted and inert, alongside endReached.',
        },
        {
          name: 'atBottomThreshold',
          type: 'number',
          description: 'Accepted and inert, alongside endReached.',
        },
        {
          name: 'bottomLoading',
          type: 'boolean',
          description: 'Accepted and inert, alongside endReached.',
        },
        {
          name: 'filterOption',
          type: 'boolean | ((input: string, option?: any) => boolean)',
          description:
            'Accepted and inert — Selector filters on the visible option label.',
        },
        {
          name: 'defaultActiveFirstOption',
          type: 'boolean',
          description: 'Accepted and inert.',
        },
        {
          name: 'title',
          type: 'string',
          description: 'Accepted and inert.',
        },
        {
          name: 'ref',
          type: 'React.Ref<any>',
          description:
            'Accepted and inert — Astryx Selector exposes no imperative focus/blur handle.',
        },
      ],
    },
    {
      name: 'BAISelectOptionItem',
      displayName: 'BAI Select Option Item',
      description:
        'A carrier element for the children form of the option list. It renders nothing; BAISelect walks the element tree and flattens it into the Astryx option model.',
      props: [
        {
          name: 'value',
          type: 'string | number | null',
          description: 'Value emitted when this option is selected.',
        },
        {
          name: 'label',
          type: 'string',
          description:
            'Text shown on the closed trigger and matched by search when children is rich JSX whose key facts the text flattener cannot reach.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          description: 'Makes the option unselectable.',
        },
        {
          name: 'filterValue',
          type: 'string',
          description:
            'Accepted and ignored — a synthetic search key would leak onto the trigger, since Astryx renders the option label there too.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'The option row. Rich JSX survives, restored through renderOption.',
        },
      ],
    },
    {
      name: 'BAISelectOptionGroup',
      displayName: 'BAI Select Option Group',
      description:
        'A carrier element that groups BAISelectOptionItem children under a heading. It renders nothing; BAISelect turns it into a native Astryx option section.',
      props: [
        {
          name: 'label',
          type: 'ReactNode',
          description:
            'Section heading, flattened to a string for the accessible name.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'The BAISelectOptionItem elements in this group.',
        },
      ],
    },
  ],
  examples: [
    {
      label: 'Single select in a form',
      code: `<BAIFormItem name="status" label={t('credential.Status')}>
  <BAISelect
    placeholder={t('credential.SelectStatus')}
    options={[
      { value: 'active', label: t('general.Active') },
      { value: 'inactive', label: t('general.Inactive') },
    ]}
  />
</BAIFormItem>`,
    },
    {
      label: 'Multiple select',
      code: `<BAISelect
  mode="multiple"
  allowClear
  style={{ width: '100%' }}
  placeholder={t('rbac.SelectUsers')}
  options={userOptions}
  onChange={(value: string[]) => setUserIds(value)}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
