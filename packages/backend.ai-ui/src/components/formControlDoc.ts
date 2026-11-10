/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/

/** One component a form-control re-export file exposes. */
interface FormControlEntry {
  /** The BAI name, e.g. `BAITextInput`. */
  name: string;
  /** The ui-common name it re-exports, e.g. `TextInput`. */
  uiCommon: string;
  description: string;
}

const displayNameOf = (name: string) =>
  `BAI ${name.slice(3).replace(/([a-z])([A-Z])/g, '$1 $2')}`;

/**
 * The catalog doc of a `BAI<X>.tsx` that re-exports a ui-common form control
 * unchanged (ADR 0014). Unstamped, so the `components` list needs no props.
 */
export const formControlDoc = (
  entries: [FormControlEntry, ...FormControlEntry[]],
  keywords: string[],
) => {
  const [main] = entries;
  return {
    name: main.name,
    displayName: displayNameOf(main.name),
    category: 'Data Input' as const,
    keywords: ['form', 'form item', ...keywords],
    usage: {
      description: `ui-common \`${main.uiCommon}\` under its BAI name, re-exported unchanged: the same component and props. Inside a Form.Item it takes value, onChange, disabled, status and its accessible name from the item and fills the item row. webui imports it from backend.ai-ui, not from the ui-common subpath (ADR 0014). Props: \`ui-common component ${main.uiCommon}\`.`,
      bestPractices: [
        {
          guidance: true,
          description:
            'Put the control directly inside a Form.Item; the item owns the visible label, rules, help and extra.',
        },
        {
          guidance: true,
          description:
            'Pass aria-label only where no Form.Item label names the control (a row field, a toolbar).',
        },
        {
          guidance: false,
          description:
            'Wrap the control in another element inside a Form.Item: the item clones its direct child, so the wrapper takes the value and onChange.',
        },
      ],
    },
    components: entries.map((entry) => ({
      name: entry.name,
      displayName: displayNameOf(entry.name),
      description: `ui-common \`${entry.uiCommon}\`, re-exported unchanged. ${entry.description}`,
    })),
  };
};
