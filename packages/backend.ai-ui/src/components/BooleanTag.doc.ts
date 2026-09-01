import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BooleanTag',
  displayName: 'Boolean Tag',
  category: 'Feedback & Status',
  keywords: [
    'boolean',
    'tag',
    'badge',
    'chip',
    'flag',
    'enabled',
    'yes no',
    'toggle state',
  ],
  usage: {
    description:
      'Renders a boolean field as a labelled badge — the standard cell for on/off columns in tables and for yes/no rows in metadata lists. It renders an Astryx `Badge`: a green one for `true` (the variant comes from the repo-wide tag-colour lookup, never a local colour map) and a neutral one at 50% opacity for `false`, so a negative value reads as de-emphasised rather than as an alarm. Anything that is not a boolean — `null`, `undefined`, a missing field — renders `fallback` instead, which keeps an unknown value visually distinct from a false one.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Translate `trueLabel` and `falseLabel` with wording that names the field ("Enabled" / "Disabled", "Public" / "Private"); the untranslated "True" / "False" defaults are a developer fallback.',
      },
      {
        guidance: true,
        description:
          'Pass the raw nullable field straight through as `value` when "not set" is meaningful, so the fallback shows instead of a misleading "False".',
      },
      {
        guidance: true,
        description:
          'Coalesce to `false` at the call site (`value={record.flag ?? false}`) when the backend omits the field but the semantics really are "off".',
      },
      {
        guidance: false,
        description:
          'Use it for a lifecycle or health state — a session status or an agent state has more than two outcomes and belongs in BAIBadge or a status dot.',
      },
    ],
  },
  props: [
    {
      name: 'value',
      type: 'boolean | null | undefined',
      description:
        'The value to display. Only a real boolean produces a badge; anything else renders `fallback`.',
      required: true,
    },
    {
      name: 'trueLabel',
      type: 'string',
      description: 'Text on the green badge shown when `value` is true.',
      default: "'True'",
    },
    {
      name: 'falseLabel',
      type: 'string',
      description:
        'Text on the de-emphasised neutral badge shown when `value` is false.',
      default: "'False'",
    },
    {
      name: 'fallback',
      type: 'React.ReactNode',
      description:
        'Rendered in place of a badge when `value` is not a boolean — an unset or unknown field.',
      default: "'-'",
    },
  ],
  examples: [
    {
      label: 'Table cell',
      code: `{
  key: 'totp_activated',
  title: t('comp:UserNodes.TwoFA'),
  render: (__, record) => (
    <BooleanTag
      value={record.security?.totpActivated ?? false}
      trueLabel={t('comp:UserNodes.Enabled')}
      falseLabel={t('comp:UserNodes.Disabled')}
    />
  ),
}`,
    },
    {
      label: 'Metadata row with a custom fallback',
      code: `<MetadataListItem label={t('deployment.Visibility')}>
  <BooleanTag
    value={deployment?.networkAccess.openToPublic}
    trueLabel={t('deployment.Public')}
    falseLabel={t('deployment.Private')}
    fallback={renderFallback()}
  />
</MetadataListItem>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
