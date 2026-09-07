import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAccentBadge',
  displayName: 'BAI Accent Badge',
  category: 'Feedback & Status',
  keywords: ['accent badge', 'brand badge', 'primary tag', 'admin tag', 'pill'],
  usage: {
    description:
      'A read-only badge painted in the ACTIVE MENU GROUP\'s primary through `--color-accent`, which `AutoAdminPrimaryColorProvider` already resolves per scope — so the same badge is orange under the user menu and blue under admin. Astryx `Badge.variant` has no ambient-accent member (this theme pins `info` to a fixed blue), which is why the colour comes from an unlayered class in BAIAccentBadge.css rather than a variant. Use it where a badge must read as "the brand one" — the `admin` permission tag and the main-access-key tag — and plain `Badge` with a hue variant everywhere else. Every Badge prop passes through except `variant`, which this component owns.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Reserve it for the one badge in a group that carries brand emphasis, so it stays distinguishable from the neutral/hued badges beside it.',
      },
      {
        guidance: false,
        description:
          'Expect the same colour on every page — it resolves from the surrounding menu scope, so user and admin pages differ on purpose.',
      },
      {
        guidance: false,
        description:
          'Reach for `variant` to recolour it; the prop is omitted because the accent is owned here.',
      },
    ],
  },
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description: 'Badge text content, same as Astryx Badge.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Optional leading icon, same as Astryx Badge.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        "Extra class on the badge, appended to the component's own bai-accent-badge class rather than replacing it.",
    },
  ],
  examples: [
    {
      label: 'Admin permission tag',
      code: `<HStack gap={1}>
  <BAIAccentBadge label="admin" />
  <Badge variant="green" label="user" />
</HStack>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
