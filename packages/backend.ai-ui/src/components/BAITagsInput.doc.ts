import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAITagsInput',
      uiCommon: 'TagsInput',
      description:
        'Free-form tags as a string array, split on tokenSeparators as typed or pasted.',
    },
  ],
  ['tags', 'chips', 'token input'],
) satisfies ComponentDoc;

export default docs;
