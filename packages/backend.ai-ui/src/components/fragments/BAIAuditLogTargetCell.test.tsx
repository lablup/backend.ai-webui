import BAIAuditLogTargetCell from './BAIAuditLogTargetCell';
import { render, screen } from '@testing-library/react';

vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-relay')>()),
  useFragment: (_fragment: unknown, ref: unknown) => ref,
}));

const ACTION_ID = '0c1d2e3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f';
const TARGET_ID = '3e4f5a6b-7c8d-4e9f-a0b1-c2d3e4f5a6b7';

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

const renderCell = (auditLog: Record<string, unknown>, runCount?: number) =>
  render(
    <BAIAuditLogTargetCell
      auditLogFrgmt={
        {
          actionId: ACTION_ID,
          actionKind: null,
          entityType: null,
          targetEntityId: null,
          lookupKind: null,
          lookupKey: null,
          entity: null,
          scopes: { count: 0, edges: [] },
          ...auditLog,
        } as never
      }
      runCount={runCount}
    />,
  );

describe('BAIAuditLogTargetCell', () => {
  it('shows the type and name of a SINGLE_ENTITY target', () => {
    renderCell({
      actionKind: 'SINGLE_ENTITY',
      entityType: 'session',
      targetEntityId: TARGET_ID,
      entity: { __typename: 'SessionV2', metadata: { name: 'my-session' } },
    });
    expect(screen.getByText('session')).toBeInTheDocument();
    expect(screen.getByText('my-session')).toBeInTheDocument();
    expect(screen.queryByText(TARGET_ID)).not.toBeInTheDocument();
  });

  it('falls back to the type and id when the entity was deleted', () => {
    renderCell({
      actionKind: 'SINGLE_ENTITY',
      entityType: 'vfolder',
      targetEntityId: TARGET_ID,
    });
    expect(screen.getByText('vfolder')).toBeInTheDocument();
    expect(screen.getAllByText(TARGET_ID).length).toBeGreaterThan(0);
  });

  it('shows the run id and the run-count badge for a BULK run', () => {
    renderCell(
      {
        actionKind: 'BULK',
        entityType: 'session',
        targetEntityId: TARGET_ID,
        entity: { __typename: 'SessionV2', metadata: { name: 'batch-01' } },
      },
      3,
    );
    expect(screen.getByText('batch-01')).toBeInTheDocument();
    expect(screen.getByText('Run')).toBeInTheDocument();
    expect(screen.getAllByText(ACTION_ID).length).toBeGreaterThan(0);
    expect(screen.getByText('3 in this run')).toBeInTheDocument();
  });

  it('hides the run-count badge for a single-row BULK run', () => {
    renderCell({
      actionKind: 'BULK',
      entityType: 'session',
      targetEntityId: TARGET_ID,
    });
    expect(screen.getByText('Run')).toBeInTheDocument();
    expect(screen.queryByText(/in this run/)).not.toBeInTheDocument();
  });

  it('shows the SCOPE entity with its scopes and the overflow count', () => {
    renderCell({
      actionKind: 'SCOPE',
      entityType: 'vfolder',
      targetEntityId: TARGET_ID,
      entity: { __typename: 'VFolder', metadata: { name: 'shared-data' } },
      scopes: {
        count: 5,
        edges: [
          { node: domainScope },
          { node: projectScope },
          { node: userScope },
        ],
      },
    });
    expect(screen.getByText('shared-data')).toBeInTheDocument();
    expect(screen.getByText('default')).toBeInTheDocument();
    expect(screen.getByText('model-store')).toBeInTheDocument();
    expect(screen.getByText('user@lablup.com')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('shows "No affected entity" for a SCOPE without a target', () => {
    renderCell({
      actionKind: 'SCOPE',
      entityType: 'vfolder',
      scopes: { count: 1, edges: [{ node: projectScope }] },
    });
    expect(screen.getByText('No affected entity')).toBeInTheDocument();
    expect(screen.getByText('model-store')).toBeInTheDocument();
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it('shows both sides of a RELATION', () => {
    renderCell({
      actionKind: 'RELATION',
      scopes: {
        count: 2,
        edges: [{ node: projectScope }, { node: userScope }],
      },
    });
    expect(screen.getByText('project')).toBeInTheDocument();
    expect(screen.getByText('model-store')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getByText('user@lablup.com')).toBeInTheDocument();
  });

  it('shows the single scope of a RELATION with fewer than two scopes', () => {
    renderCell({
      actionKind: 'RELATION',
      scopes: { count: 1, edges: [{ node: projectScope }] },
    });
    expect(screen.getByText('model-store')).toBeInTheDocument();
    expect(screen.queryByText('user@lablup.com')).not.toBeInTheDocument();
  });

  it('shows a dash for a RELATION without scopes', () => {
    renderCell({ actionKind: 'RELATION' });
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('shows the MEMBERSHIP entity and only its first scope', () => {
    renderCell({
      actionKind: 'MEMBERSHIP',
      entityType: 'user',
      targetEntityId: userScope.scopeId,
      entity: userScope.entity,
      scopes: {
        count: 2,
        edges: [{ node: projectScope }, { node: domainScope }],
      },
    });
    expect(screen.getByText('user@lablup.com')).toBeInTheDocument();
    expect(screen.getByText('model-store')).toBeInTheDocument();
    expect(screen.queryByText('default')).not.toBeInTheDocument();
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });

  it('shows a Global token for GLOBAL', () => {
    renderCell({ actionKind: 'GLOBAL', entityType: 'global' });
    expect(screen.getByText('Global')).toBeInTheDocument();
  });

  it('shows the LOOKUP key and the entity it resolved to', () => {
    renderCell({
      actionKind: 'LOOKUP',
      entityType: 'user',
      lookupKind: 'email',
      lookupKey: 'user@lablup.com',
      targetEntityId: userScope.scopeId,
      entity: userScope.entity,
    });
    expect(screen.getByText('email: user@lablup.com')).toBeInTheDocument();
    expect(screen.getByText('user@lablup.com')).toBeInTheDocument();
    expect(screen.queryByText('Not found')).not.toBeInTheDocument();
  });

  it('shows "Not found" for a LOOKUP miss', () => {
    renderCell({
      actionKind: 'LOOKUP',
      entityType: 'user',
      lookupKind: 'email',
      lookupKey: 'missing@lablup.com',
    });
    expect(screen.getByText('email: missing@lablup.com')).toBeInTheDocument();
    expect(screen.getByText('Not found')).toBeInTheDocument();
  });

  it('shows the raw type and id of a legacy record without a kind', () => {
    renderCell({
      entityType: 'session',
      targetEntityId: TARGET_ID,
      entity: { __typename: 'SessionV2', metadata: { name: 'my-session' } },
    });
    expect(screen.getByText('session')).toBeInTheDocument();
    expect(screen.getAllByText(TARGET_ID).length).toBeGreaterThan(0);
    expect(screen.queryByText('my-session')).not.toBeInTheDocument();
  });

  it('shows a dash for a legacy record without type or id', () => {
    renderCell({});
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
