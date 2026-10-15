import {
  BAIAuditLogTargetCellEntityFragment$data,
  BAIAuditLogTargetCellEntityFragment$key,
} from '../../__generated__/BAIAuditLogTargetCellEntityFragment.graphql';
import { BAIAuditLogTargetCellFragment$key } from '../../__generated__/BAIAuditLogTargetCellFragment.graphql';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIFlex from '../BAIFlex';
import BAIId from '../BAIId';
import BAIText from '../BAIText';
import { Badge } from '@lablup/ui-common/Badge';
import { Token } from '@lablup/ui-common/Token';
import * as _ from 'lodash-es';
import { ArrowLeftRight, CornerDownRight } from 'lucide-react';
import { ReactNode } from 'react';
import { graphql, useFragment } from 'react-relay';

const getEntityName = (
  entity: BAIAuditLogTargetCellEntityFragment$data,
): string | null | undefined => {
  switch (entity.__typename) {
    case 'UserV2':
      return entity.basicInfo.email;
    case 'ProjectV2':
    case 'DomainV2':
      return entity.basicInfo.name;
    case 'ImageV2':
      return entity.identity.canonicalName;
    case 'SessionV2':
    case 'ModelDeployment':
    case 'VFolder':
      return entity.metadata.name;
    case 'VirtualFolderNode':
      return entity.vfolderName;
    case 'ComputeSessionNode':
      return entity.sessionName;
    case 'ContainerRegistryV2':
      return entity.registryName;
    case 'AppConfigAllowList':
    case 'AppConfigDefinition':
    case 'AppConfigFragment':
      return entity.configName;
    case 'StorageNamespace':
      return entity.namespace;
    case 'Artifact':
    case 'ArtifactRegistry':
    case 'NotificationChannel':
    case 'NotificationRule':
    case 'ResourceGroup':
    case 'Role':
    case 'IdleChecker':
    case 'ObjectStorage':
    case 'RuntimeVariant':
    case 'RuntimeVariantPreset':
    case 'VFSStorage':
      return entity.name;
    default:
      return null;
  }
};

interface EntityLabelProps {
  entityType: string | null;
  entityId: string | null;
  entityFrgmt?: BAIAuditLogTargetCellEntityFragment$key | null;
}

const EntityLabel = ({
  entityType,
  entityId,
  entityFrgmt,
}: EntityLabelProps) => {
  'use memo';
  const entity = useFragment<BAIAuditLogTargetCellEntityFragment$key>(
    graphql`
      fragment BAIAuditLogTargetCellEntityFragment on EntityNode {
        __typename
        ... on UserV2 {
          basicInfo {
            email
          }
        }
        ... on ProjectV2 {
          basicInfo {
            name
          }
        }
        ... on DomainV2 {
          basicInfo {
            name
          }
        }
        ... on ImageV2 {
          identity {
            canonicalName
          }
        }
        ... on SessionV2 {
          metadata {
            name
          }
        }
        ... on ModelDeployment {
          metadata {
            name
          }
        }
        ... on VFolder {
          metadata {
            name
          }
        }
        ... on VirtualFolderNode {
          vfolderName: name
        }
        ... on ComputeSessionNode {
          sessionName: name
        }
        ... on ContainerRegistryV2 {
          registryName
        }
        ... on AppConfigAllowList {
          configName
        }
        ... on AppConfigDefinition {
          configName
        }
        ... on AppConfigFragment {
          configName
        }
        ... on StorageNamespace {
          namespace
        }
        ... on Artifact {
          name
        }
        ... on ArtifactRegistry {
          name
        }
        ... on NotificationChannel {
          name
        }
        ... on NotificationRule {
          name
        }
        ... on ResourceGroup {
          name
        }
        ... on Role {
          name
        }
        ... on IdleChecker {
          name
        }
        ... on ObjectStorage {
          name
        }
        ... on RuntimeVariant {
          name
        }
        ... on RuntimeVariantPreset {
          name
        }
        ... on VFSStorage {
          name
        }
      }
    `,
    entityFrgmt ?? null,
  );

  const name = entity ? getEntityName(entity) : null;
  const typeLabel = entityType || entity?.__typename;

  if (!name && !entityId && !typeLabel) {
    return '-';
  }

  return (
    <BAIFlex gap="xs">
      {typeLabel ? <Token label={typeLabel} /> : null}
      {name ? (
        <BAIText ellipsis={{ tooltip: true }} style={{ maxWidth: 200 }}>
          {name}
        </BAIText>
      ) : entityId ? (
        <BAIId uuid={entityId} />
      ) : null}
    </BAIFlex>
  );
};

interface AuditLogScope {
  readonly id: string;
  readonly scopeType: string;
  readonly scopeId: string;
  readonly entity: BAIAuditLogTargetCellEntityFragment$key | null | undefined;
}

const ScopeLine = ({
  scopes,
  hiddenScopeCount = 0,
}: {
  scopes: ReadonlyArray<AuditLogScope>;
  hiddenScopeCount?: number;
}) => {
  'use memo';
  if (_.isEmpty(scopes)) {
    return null;
  }
  return (
    <BAIFlex gap="xs" wrap="wrap">
      <CornerDownRight size="1em" />
      {_.map(scopes, (scope) => (
        <EntityLabel
          key={scope.id}
          entityType={scope.scopeType}
          entityId={scope.scopeId}
          entityFrgmt={scope.entity}
        />
      ))}
      {hiddenScopeCount > 0 ? <Badge label={`+${hiddenScopeCount}`} /> : null}
    </BAIFlex>
  );
};

export interface BAIAuditLogTargetCellProps {
  auditLogFrgmt: BAIAuditLogTargetCellFragment$key;
  runCount?: number;
}

const BAIAuditLogTargetCell = ({
  auditLogFrgmt,
  runCount = 1,
}: BAIAuditLogTargetCellProps) => {
  'use memo';
  const { t } = useBAIi18n();
  const auditLog = useFragment<BAIAuditLogTargetCellFragment$key>(
    graphql`
      fragment BAIAuditLogTargetCellFragment on AuditLogV2 {
        actionId
        actionKind
        entityType
        entityId
        targetEntityId
        lookupKind
        lookupKey
        entity {
          ...BAIAuditLogTargetCellEntityFragment
        }
        scopes(
          first: 3
          orderBy: [
            { field: SCOPE_TYPE, direction: ASC }
            { field: SCOPE_ID, direction: ASC }
          ]
        ) {
          count
          edges {
            node {
              id
              scopeType
              scopeId
              entity {
                ...BAIAuditLogTargetCellEntityFragment
              }
            }
          }
        }
      }
    `,
    auditLogFrgmt,
  );

  const entityType = auditLog.entityType || null;
  const entityId = (auditLog.targetEntityId ?? auditLog.entityId) || null;
  const scopes: ReadonlyArray<AuditLogScope> = _.map(
    auditLog.scopes.edges,
    'node',
  );
  const hiddenScopeCount = Math.max(auditLog.scopes.count - scopes.length, 0);

  const entityLabel = entityId ? (
    <EntityLabel
      entityType={entityType}
      entityId={entityId}
      entityFrgmt={auditLog.entity}
    />
  ) : null;

  let content: ReactNode;
  switch (auditLog.actionKind) {
    case 'SINGLE_ENTITY':
      content = entityLabel ?? '-';
      break;
    case 'BULK':
      content = (
        <>
          {entityLabel ?? '-'}
          <BAIFlex gap="xs">
            <BAIText type="secondary">
              {t('comp:BAIAuditLogTargetCell.Run')}
            </BAIText>
            <BAIId uuid={auditLog.actionId} />
            {runCount > 1 ? (
              <Badge
                label={t('comp:BAIAuditLogTargetCell.InThisRun', {
                  count: runCount,
                })}
              />
            ) : null}
          </BAIFlex>
        </>
      );
      break;
    case 'SCOPE':
      content = (
        <>
          {entityLabel ?? (
            <BAIText type="secondary">
              {t('comp:BAIAuditLogTargetCell.NoAffectedEntity')}
            </BAIText>
          )}
          <ScopeLine scopes={scopes} hiddenScopeCount={hiddenScopeCount} />
        </>
      );
      break;
    case 'RELATION': {
      const [from, to] = scopes;
      if (scopes.length >= 2) {
        content = (
          <BAIFlex gap="xs" wrap="wrap">
            <EntityLabel
              entityType={from.scopeType}
              entityId={from.scopeId}
              entityFrgmt={from.entity}
            />
            <ArrowLeftRight size="1em" />
            <EntityLabel
              entityType={to.scopeType}
              entityId={to.scopeId}
              entityFrgmt={to.entity}
            />
          </BAIFlex>
        );
      } else {
        content = _.isEmpty(scopes) ? (
          '-'
        ) : (
          <ScopeLine scopes={scopes} hiddenScopeCount={hiddenScopeCount} />
        );
      }
      break;
    }
    case 'MEMBERSHIP':
      content = (
        <>
          {entityLabel ?? '-'}
          {scopes[0] ? <ScopeLine scopes={[scopes[0]]} /> : null}
        </>
      );
      break;
    case 'GLOBAL':
      content = <Token label={t('comp:BAIAuditLogTargetCell.Global')} />;
      break;
    case 'LOOKUP':
      content = (
        <>
          <BAIText monospace ellipsis={{ tooltip: true }}>
            {`${auditLog.lookupKind || '-'}: ${auditLog.lookupKey || '-'}`}
          </BAIText>
          {entityLabel ?? (
            <BAIText type="secondary">
              {t('comp:BAIAuditLogTargetCell.NotFound')}
            </BAIText>
          )}
        </>
      );
      break;
    default:
      content =
        entityType || entityId ? (
          <EntityLabel entityType={entityType} entityId={entityId} />
        ) : (
          '-'
        );
  }

  return (
    <BAIFlex direction="column" align="start" gap="xxs">
      {content}
    </BAIFlex>
  );
};

export default BAIAuditLogTargetCell;
