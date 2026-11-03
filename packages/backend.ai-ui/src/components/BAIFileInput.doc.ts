import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAIFileInput',
      uiCommon: 'FileInput',
      description: 'A file picker.',
    },
  ],
  ['file', 'upload', 'file picker'],
) satisfies ComponentDoc;

export default docs;
