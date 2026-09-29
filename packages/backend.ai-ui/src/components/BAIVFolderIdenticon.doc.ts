import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIVFolderIdenticon',
  displayName: 'BAI VFolder Identicon',
  category: 'Content',
  keywords: ['vfolder', 'folder', 'identicon', 'avatar', 'icon', 'glyph'],
  usage: {
    description:
      'The small generated glyph drawn before a virtual folder name, so folders with similar names can be told apart at a glance. The glyph is a deterministic function of its seed. It is sized `1em`, so it follows the font size of the text it sits in, and it is decorative: the folder name beside it is the accessible text.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass `vfolderId` (the dashed UUID) when you hold a plain folder id; the glyph then matches the one the `VirtualFolderNode`-based folder lists (the Data page) draw for the same folder.',
      },
      {
        guidance: true,
        description:
          'Pass `seed` when you already hold the Relay global id of the node, as the host Relay identicons do.',
      },
      {
        guidance: false,
        description:
          'Render it without the folder name next to it — the glyph carries no accessible name of its own.',
      },
    ],
  },
  props: [
    {
      name: 'vfolderId',
      type: 'string',
      description:
        'Dashed vfolder UUID. Seeds the glyph as the `VirtualFolderNode` global id.',
    },
    {
      name: 'seed',
      type: 'string',
      description: 'Explicit seed. Wins over `vfolderId`.',
    },
  ],
  examples: [
    {
      label: 'Before a folder name',
      code: `<BAIFlex gap="xs" align="center">
  <BAIVFolderIdenticon vfolderId={folder.id} />
  <BAIText>{folder.name}</BAIText>
</BAIFlex>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
