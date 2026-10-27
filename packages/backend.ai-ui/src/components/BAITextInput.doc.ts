import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAITextInput',
      uiCommon: 'TextInput',
      description: 'Single-line text.',
    },
  ],
  ['input', 'text input', 'text field'],
) satisfies ComponentDoc;

export default docs;
