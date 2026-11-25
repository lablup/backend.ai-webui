import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAIPasswordInput',
      uiCommon: 'PasswordInput',
      description: 'Password with a show/hide toggle.',
    },
  ],
  ['password', 'password input', 'show password', 'reveal'],
) satisfies ComponentDoc;

export default docs;
