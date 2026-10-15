import { useBAIi18n } from '../hooks/useBAIi18n';
import { Token, type TokenProps } from '@lablup/ui-common/Token';

export type AuditLogActionKind =
  | 'SINGLE_ENTITY'
  | 'BULK'
  | 'SCOPE'
  | 'RELATION'
  | 'MEMBERSHIP'
  | 'GLOBAL'
  | 'LOOKUP';

export const AUDIT_LOG_ACTION_KINDS: ReadonlyArray<AuditLogActionKind> = [
  'SINGLE_ENTITY',
  'BULK',
  'SCOPE',
  'RELATION',
  'MEMBERSHIP',
  'GLOBAL',
  'LOOKUP',
];

export const useAuditLogActionKindOptions = () => {
  'use memo';
  const { t } = useBAIi18n();
  const labels: Record<AuditLogActionKind, string> = {
    SINGLE_ENTITY: t('comp:BAIAuditLogActionKindToken.SingleEntity'),
    BULK: t('comp:BAIAuditLogActionKindToken.Bulk'),
    SCOPE: t('comp:BAIAuditLogActionKindToken.Scope'),
    RELATION: t('comp:BAIAuditLogActionKindToken.Relation'),
    MEMBERSHIP: t('comp:BAIAuditLogActionKindToken.Membership'),
    GLOBAL: t('comp:BAIAuditLogActionKindToken.Global'),
    LOOKUP: t('comp:BAIAuditLogActionKindToken.Lookup'),
  };
  return AUDIT_LOG_ACTION_KINDS.map((value) => ({
    value,
    label: labels[value],
  }));
};

export interface BAIAuditLogActionKindTokenProps extends Omit<
  TokenProps,
  'label'
> {
  actionKind: string;
}

const BAIAuditLogActionKindToken = ({
  actionKind,
  ...tokenProps
}: BAIAuditLogActionKindTokenProps) => {
  'use memo';
  const options = useAuditLogActionKindOptions();
  const label =
    options.find((option) => option.value === actionKind)?.label ?? actionKind;

  return <Token {...tokenProps} label={label} />;
};

export default BAIAuditLogActionKindToken;
