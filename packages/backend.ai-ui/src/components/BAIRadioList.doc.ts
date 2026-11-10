import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAIRadioList',
      uiCommon: 'RadioList',
      description: 'A single choice shown as radios.',
    },
    {
      name: 'BAIRadioListItem',
      uiCommon: 'RadioListItem',
      description: 'One option of BAIRadioList.',
    },
  ],
  ['radio', 'radio group', 'single choice'],
) satisfies ComponentDoc;

export default docs;
