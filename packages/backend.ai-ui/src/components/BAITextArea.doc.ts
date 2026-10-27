import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAITextArea',
      uiCommon: 'TextArea',
      description: 'Multi-line text.',
    },
  ],
  ['textarea', 'multiline', 'text'],
) satisfies ComponentDoc;

export default docs;
