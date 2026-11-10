import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAINumberInput',
      uiCommon: 'NumberInput',
      description:
        'A number; an emptied field reports null while hasClear is true (the default).',
    },
  ],
  ['number', 'number input', 'numeric'],
) satisfies ComponentDoc;

export default docs;
