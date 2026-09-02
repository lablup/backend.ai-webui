import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAllowedVfolderHostsWithPermission',
  displayName: 'BAI Allowed Vfolder Hosts With Permission',
  category: 'Content',
  keywords: [
    'allowed hosts',
    'vfolder host',
    'storage host',
    'permissions',
    'resource policy',
    'access control',
  ],
  usage: {
    description:
      'Renders the allowed_vfolder_hosts map of a keypair resource policy or a project as a wrapped row of clickable host names, each prefixed by a lock icon coloured for how much access that host grants: an open success lock when the host allows exactly the full permission set, an open warning lock when it allows some, and a closed error lock when it allows none. Clicking a host opens a modal listing every vfolder host permission with a check or a ban mark. It is Relay-bound in two ways — the caller spreads either BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment (on KeyPairResourcePolicy) or BAIAllowedVfolderHostsWithPermissionFromGroupFragment (on GroupNode) and passes the resulting fragment reference, and the component itself runs BAIAllowedVfolderHostsWithPermissionQuery for the canonical permission list. The two props are a union: exactly one may be given. The query suspends, so the component needs a Suspense boundary above it.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread the matching fragment on the row or node the parent already queries, and hand the same object straight through — the component calls useFragment itself.',
      },
      {
        guidance: true,
        description:
          'Guard the call site when allowed_vfolder_hosts is empty or absent and render a dash instead: an empty map produces an empty row rather than a placeholder.',
      },
      {
        guidance: true,
        description:
          'Place it inside a Suspense boundary, since the permission-list query suspends on first render.',
      },
      {
        guidance: false,
        description:
          'Pass both fragment props — the type is a union with never on the unused side, and the keypair fragment wins if both carry data.',
      },
      {
        guidance: false,
        description:
          'Treat the colour as a per-permission signal; it summarises the whole host, and the exact permissions are only visible in the modal.',
      },
    ],
  },
  props: [
    {
      name: 'allowedHostPermissionFrgmtFromKeyPair',
      type: 'BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment$key',
      description:
        'Fragment reference on KeyPairResourcePolicy, read for its allowed_vfolder_hosts JSON string. Give this or allowedHostPermissionFrgmtFromGroup, never both.',
    },
    {
      name: 'allowedHostPermissionFrgmtFromGroup',
      type: 'BAIAllowedVfolderHostsWithPermissionFromGroupFragment$key',
      description:
        'Fragment reference on GroupNode, read for the same allowed_vfolder_hosts field. Give this or allowedHostPermissionFrgmtFromKeyPair, never both.',
    },
    {
      name: 'allowedVfolderHostEntries',
      type: 'ReadonlyArray<{ host: string; permissions: ReadonlyArray<string> }>',
      description:
        'The Strawberry V2 allowedVfolderHosts list, passed as plain data instead of a fragment reference. Permission values may be V2 enum names (MOUNT_IN_SESSION) — they are normalized to the canonical kebab keys internally. Mutually exclusive with the two fragment props.',
    },
  ],
  examples: [
    {
      label: 'Allowed hosts column in the keypair resource policy table',
      code: `{
  title: t('resourcePolicy.AllowedHosts'),
  dataIndex: 'allowed_vfolder_hosts',
  render: (text, row) =>
    text && row ? (
      <BAIAllowedVfolderHostsWithPermission
        allowedHostPermissionFrgmtFromKeyPair={row}
      />
    ) : (
      '-'
    ),
}`,
    },
    {
      label: 'From a project node',
      code: `<Suspense fallback={<BAISkeleton active />}>
  <BAIAllowedVfolderHostsWithPermission
    allowedHostPermissionFrgmtFromGroup={groupNode}
  />
</Suspense>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
