import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAICheckboxList',
      uiCommon: 'CheckboxList',
      description: 'A group of checkboxes holding an array of values.',
    },
    {
      name: 'BAICheckboxListItem',
      uiCommon: 'CheckboxListItem',
      description: 'One option of BAICheckboxList.',
    },
  ],
  ['checkbox', 'checkbox group', 'multiple choice'],
) satisfies ComponentDoc;

export default docs;
