import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIComplexSelect',
  displayName: 'BAI Complex Select',
  category: 'Data Input',
  keywords: [
    'select',
    'combobox',
    'autocomplete',
    'infinite scroll',
    'paginated select',
    'async select',
    'typeahead',
  ],
  usage: {
    description:
      'The select foundation for server-backed option lists — a Relay connection paged a few rows at a time, searched server-side, and loaded further by scrolling the popup. It renders Astryx ComplexSelector, which hands the popup body back as a render prop, and that body is what this component owns: the search box, the roving-highlight listbox, the scroll-to-bottom hook that drives `loadNext`, and the total-count footer. Its value is antd `labelInValue`-shaped ({ label, value }, an array in multiple mode), so BAIFormItem bindings and mutation payloads carry labels without a normalizer. Use BAISelect instead when the options are a fixed local list; use this when the list is paginated or the search runs on the server. Roughly twenty Relay-backed `*Select` wrappers are built on it.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Wire `endReached` to Relay’s `loadNext` and `total` to the connection count, so scrolling the popup pages the query rather than truncating it.',
      },
      {
        guidance: true,
        description:
          'Debounce upstream of `onSearch` — it fires on every keystroke, and the component only mirrors the value back.',
      },
      {
        guidance: true,
        description:
          'Keep `label` a real string on every instance and add `isLabelHidden` inside a form item; it is the accessible name, and Astryx fields require one.',
      },
      {
        guidance: true,
        description:
          'Put rich per-row content in an option’s `description` and `extra` slots, since `label` must stay a plain string for the trigger and the live region.',
      },
      {
        guidance: true,
        description:
          'Use `onOpenChange` to flip a Relay fetch policy between network-only while open and store-only while closed, the way the wrapper selects do.',
      },
      {
        guidance: false,
        description:
          'Feed it hundreds of options at once — the popup renders one DOM row per loaded option, and pagination is what keeps that bounded.',
      },
      {
        guidance: false,
        description:
          'Expect the multiple-mode trigger chips to be removable; they are display-only, and deselecting happens by clicking the option row again.',
      },
    ],
  },
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name of the field, also used as the listbox label. Required by every Astryx field.',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Hides the rendered label while keeping the accessible name. Set it when the field sits inside a form item that already prints one.',
    },
    {
      name: 'value',
      type: 'BAIComplexSelectValue',
      description:
        'Current selection in `labelInValue` shape — one object, an array in multiple mode, or null.',
      default: 'null',
    },
    {
      name: 'onChange',
      type: '(value: BAIComplexSelectValue) => void',
      description:
        'Fired with the new selection. In multiple mode it receives the whole array, with the toggled option already added or removed.',
    },
    {
      name: 'options',
      type: 'Array<BAIComplexSelectOption>',
      description:
        'The currently loaded rows. Each carries a string `value` and `label`, plus optional `description`, `extra` and `disabled`.',
      default: '[]',
    },
    {
      name: 'multiple',
      type: 'boolean',
      description:
        'Allows several selections. The popup stays open on each pick and the value becomes an array.',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Trigger text shown while nothing is selected.',
    },
    {
      name: 'hasSearch',
      type: 'boolean',
      description:
        'Renders the search box at the top of the popup. Turn it off for short, fully loaded lists.',
      default: 'true',
    },
    {
      name: 'searchValue',
      type: 'string',
      description:
        'Controlled search text. Left unset, the box keeps its own state so it still works without a server query.',
    },
    {
      name: 'onSearch',
      type: '(value: string) => void',
      description:
        'Fired on every keystroke in the search box. Debounce before turning it into a query.',
    },
    {
      name: 'searchPlaceholder',
      type: 'string',
      description:
        'Placeholder and accessible name of the search box. Defaults to the localized "Search".',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Shows the pending state on the trigger, for the first page or a search still in flight.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Blocks interaction with the field.',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: 'Marks the field as required on the Astryx field chrome.',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        'Marks the field as optional, for forms where required is the norm.',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Helper text rendered under the field.',
    },
    {
      name: 'status',
      type: 'ComplexSelectorStatus',
      description: 'Validation state on the field, such as an error message.',
    },
    {
      name: 'size',
      type: 'ComplexSelectorSize',
      description: 'Control height, in the Astryx size vocabulary.',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description: 'Field width, forwarded to ComplexSelector.',
      default: "'100%'",
    },
    {
      name: 'endReached',
      type: '() => void',
      description:
        'Fired once each time the option list scrolls within `atBottomThreshold` of the bottom — on the edge, not on every scroll event. Wire it to Relay `loadNext`.',
    },
    {
      name: 'atBottomThreshold',
      type: 'number',
      description:
        'Pixel distance from the bottom that counts as "at bottom" for `endReached`.',
      default: '30',
    },
    {
      name: 'atBottomStateChange',
      type: '(atBottom: boolean) => void',
      description:
        'Fired on both edges of the at-bottom state, for callers that need to know when the list leaves the bottom again.',
    },
    {
      name: 'isLoadingNext',
      type: 'boolean',
      description:
        'Shows a spinner next to the total count while the next page is in flight.',
    },
    {
      name: 'total',
      type: 'number',
      description:
        'Row count reported by the connection. A positive value renders the "Total N items" footer.',
    },
    {
      name: 'header',
      type: 'React.ReactNode',
      description:
        'Content rendered between the search box and the option list.',
    },
    {
      name: 'footer',
      type: 'React.ReactNode',
      description:
        'Content rendered below the option list. Supplying it replaces the default total-count footer.',
    },
    {
      name: 'emptyContent',
      type: 'React.ReactNode',
      description:
        'Shown in place of the list when there are no options. Defaults to the localized "No results".',
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description:
        'Reports popup open and close. The usual use is switching a Relay fetch policy between network-only and store-only.',
    },
    {
      name: 'listMaxHeight',
      type: 'number',
      description:
        'Scroll-viewport height of the option list, in pixels. It also decides how many rows a page must fill before the scroll hook can fire.',
      default: '260',
    },
    {
      name: 'triggerDisplay',
      type: "'labels' | 'badges'",
      description:
        'How the multiple-mode trigger summarizes the selection: comma-joined labels that keep the control one row tall, or Token chips that wrap.',
      default: "'labels'",
    },
    {
      name: 'maxTriggerTokens',
      type: 'number',
      description:
        'Labels or chips shown in the trigger before the rest collapse into "+N".',
      default: '3',
    },
    {
      name: 'data-testid',
      type: 'string',
      description:
        'Test hook on the field. The option list gets the same value suffixed with `-listbox`.',
    },
  ],
  examples: [
    {
      label: 'Relay-backed select with server search and paging',
      code: `<BAIComplexSelect
  label={t('session.launcher.SelectAgent')}
  isLabelHidden={isLabelHidden}
  placeholder={placeholder}
  isLoading={searchStr !== deferredSearchStr}
  searchValue={searchStr}
  onSearch={setSearchStr}
  total={agent_summary_list?.total_count ?? undefined}
  options={options}
  value={labeledValue}
  onChange={(next) => setValue(next)}
  endReached={() => loadNext(10)}
  isLoadingNext={isLoadingNext}
/>`,
    },
    {
      label: 'Suspense fallback with the same field chrome',
      code: `<BAIComplexSelect label={label} isLabelHidden isLoading isDisabled />`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
