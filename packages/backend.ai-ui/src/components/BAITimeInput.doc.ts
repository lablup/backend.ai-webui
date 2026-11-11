import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAITimeInput',
      uiCommon: 'TimeInput',
      description: 'A time of day.',
    },
  ],
  ['time', 'time picker'],
) satisfies ComponentDoc;

export default docs;
