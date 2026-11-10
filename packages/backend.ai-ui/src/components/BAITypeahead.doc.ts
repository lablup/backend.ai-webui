import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAITypeahead',
      uiCommon: 'Typeahead',
      description: 'One item chosen from a search source.',
    },
  ],
  ['typeahead', 'autocomplete', 'search'],
) satisfies ComponentDoc;

export default docs;
