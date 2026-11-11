import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAIDateTimeInput',
      uiCommon: 'DateTimeInput',
      description: 'A date and a time.',
    },
  ],
  ['date', 'time', 'datetime picker'],
) satisfies ComponentDoc;

export default docs;
