import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAICheckboxInput',
      uiCommon: 'CheckboxInput',
      description: 'A single checkbox; visible text goes in children.',
    },
  ],
  ['checkbox'],
) satisfies ComponentDoc;

export default docs;
