import { BAIAuditLogTargetCellStoriesQuery } from '../../__generated__/BAIAuditLogTargetCellStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAIAuditLogTargetCell from './BAIAuditLogTargetCell';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, useLazyLoadQuery } from 'react-relay';

const meta: Meta<typeof BAIAuditLogTargetCell> = {
  title: 'Fragments/BAIAuditLogTargetCell',
  component: BAIAuditLogTargetCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIAuditLogTargetCell** renders the Target column of the audit log table according to the record's action kind.

## Per action kind
- \`SINGLE_ENTITY\`: the target entity, named when it still exists
- \`BULK\`: the target entity, the run id, and how many rows on the page came from the same run
- \`SCOPE\`: the affected entity (or "No affected entity") and its scopes
- \`RELATION\`: the two linked or unlinked scopes
- \`MEMBERSHIP\`: the entity and the scope it joined or left
- \`GLOBAL\`: a "Global" token
- \`LOOKUP\`: the lookup kind and key, and the entity it resolved to or "Not found"
- no kind (older records): the raw entity type and id

## Usage
\`\`\`tsx
<BAIAuditLogTargetCell auditLogFrgmt={record} runCount={3} />
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIAuditLogTargetCell>;

const QueryResolver = ({ runCount }: { runCount?: number }) => {
  const { adminAuditLogsV2 } =
    useLazyLoadQuery<BAIAuditLogTargetCellStoriesQuery>(
      graphql`
        query BAIAuditLogTargetCellStoriesQuery {
          adminAuditLogsV2(first: 1) {
            edges {
              node {
                ...BAIAuditLogTargetCellFragment
              }
            }
          }
        }
      `,
      {},
    );
  const node = adminAuditLogsV2?.edges[0]?.node;
  return node ? (
    <BAIAuditLogTargetCell auditLogFrgmt={node} runCount={runCount} />
  ) : null;
};

const projectScope = {
  id: 'scope-project',
  scopeType: 'project',
  scopeId: '5b2c1f8e-6a3d-4f7b-9c0e-1d2a3b4c5d6e',
  entity: { __typename: 'ProjectV2', basicInfo: { name: 'model-store' } },
};

const userScope = {
  id: 'scope-user',
  scopeType: 'user',
  scopeId: '8f9e0d1c-2b3a-4c5d-8e7f-6a5b4c3d2e1f',
  entity: { __typename: 'UserV2', basicInfo: { email: 'user@lablup.com' } },
};

const domainScope = {
  id: 'scope-domain',
  scopeType: 'domain',
  scopeId: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  entity: { __typename: 'DomainV2', basicInfo: { name: 'default' } },
};

const withAuditLog = (auditLog: Record<string, unknown>, runCount?: number) => (
  <RelayResolver
    mockResolvers={{
      AuditLogV2: () => ({
        actionId: '0c1d2e3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f',
        entityType: null,
        entityId: null,
        targetEntityId: null,
        lookupKind: null,
        lookupKey: null,
        entity: null,
        scopes: { count: 0, edges: [] },
        ...auditLog,
      }),
    }}
  >
    <QueryResolver runCount={runCount} />
  </RelayResolver>
);

export const SingleEntity: Story = {
  render: () =>
    withAuditLog({
      actionKind: 'SINGLE_ENTITY',
      entityType: 'session',
      targetEntityId: '3e4f5a6b-7c8d-4e9f-a0b1-c2d3e4f5a6b7',
      entity: { __typename: 'SessionV2', metadata: { name: 'my-session' } },
    }),
};

export const SingleEntityDeleted: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The entity no longer exists, so the cell falls back to the entity type and id.',
      },
    },
  },
  render: () =>
    withAuditLog({
      actionKind: 'SINGLE_ENTITY',
      entityType: 'vfolder',
      targetEntityId: '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d',
    }),
};

export const Bulk: Story = {
  render: () =>
    withAuditLog(
      {
        actionKind: 'BULK',
        entityType: 'session',
        targetEntityId: '3e4f5a6b-7c8d-4e9f-a0b1-c2d3e4f5a6b7',
        entity: { __typename: 'SessionV2', metadata: { name: 'batch-01' } },
      },
      3,
    ),
};

export const Scope: Story = {
  render: () =>
    withAuditLog({
      actionKind: 'SCOPE',
      entityType: 'vfolder',
      targetEntityId: '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d',
      entity: { __typename: 'VFolder', metadata: { name: 'shared-data' } },
      scopes: {
        count: 5,
        edges: [
          { node: domainScope },
          { node: projectScope },
          { node: userScope },
        ],
      },
    }),
};

export const ScopeWithoutEntity: Story = {
  render: () =>
    withAuditLog({
      actionKind: 'SCOPE',
      entityType: 'vfolder',
      scopes: { count: 1, edges: [{ node: projectScope }] },
    }),
};

export const Relation: Story = {
  render: () =>
    withAuditLog({
      actionKind: 'RELATION',
      scopes: {
        count: 2,
        edges: [{ node: projectScope }, { node: userScope }],
      },
    }),
};

export const Membership: Story = {
  render: () =>
    withAuditLog({
      actionKind: 'MEMBERSHIP',
      entityType: 'user',
      targetEntityId: userScope.scopeId,
      entity: userScope.entity,
      scopes: { count: 1, edges: [{ node: projectScope }] },
    }),
};

export const Global: Story = {
  render: () =>
    withAuditLog({
      actionKind: 'GLOBAL',
      entityType: 'global',
    }),
};

export const Lookup: Story = {
  render: () =>
    withAuditLog({
      actionKind: 'LOOKUP',
      entityType: 'user',
      lookupKind: 'email',
      lookupKey: 'user@lablup.com',
      targetEntityId: userScope.scopeId,
      entity: userScope.entity,
    }),
};

export const LookupMiss: Story = {
  render: () =>
    withAuditLog({
      actionKind: 'LOOKUP',
      entityType: 'user',
      lookupKind: 'email',
      lookupKey: 'missing@lablup.com',
    }),
};

export const WithoutActionKind: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A record written before the manager recorded the action kind keeps the raw entity type and id.',
      },
    },
  },
  render: () =>
    withAuditLog({
      actionKind: null,
      entityType: 'session',
      entityId: '3e4f5a6b-7c8d-4e9f-a0b1-c2d3e4f5a6b7',
    }),
};
