import { formControlDoc } from './formControlDoc';
import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = formControlDoc(
  [
    {
      name: 'BAITokenizer',
      uiCommon: 'Tokenizer',
      description:
        'Tokens chosen from a search source; free-form string tags use BAITagsInput.',
    },
  ],
  ['tokenizer', 'tokens', 'multi typeahead'],
) satisfies ComponentDoc;

export default docs;
