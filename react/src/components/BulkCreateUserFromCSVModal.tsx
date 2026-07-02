/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { BulkCreateUserFromCSVModalGroupsQuery } from '../__generated__/BulkCreateUserFromCSVModalGroupsQuery.graphql';
import {
  BulkCreateUserFromCSVModalMutation,
  CreateUserV2Input,
} from '../__generated__/BulkCreateUserFromCSVModalMutation.graphql';
import type { GeneratedKeypairListModalFragment$key } from '../__generated__/GeneratedKeypairListModalFragment.graphql';
import {
  UserRoleV2,
  UserStatusV2,
} from '../__generated__/UserSettingModalBulkCreateMutation.graphql';
import {
  buildDynamicColumnAliases,
  CanonicalUserColumn,
  extractRawUserRows,
  findMissingRequiredColumns,
  mapUserCSVColumns,
  mergeColumnAliases,
  parseBoolean,
  RawUserRow,
  TEMPLATE_CSV,
} from '../helper/bulkUserCSV';
import { downloadBlob, parseCSV } from '../helper/csv-util';
import { useCurrentDomainValue } from '../hooks';
import BAIPanelItem from './BAIPanelItem';
import GeneratedKeypairListModal from './GeneratedKeypairListModal';
import { passwordPattern } from './LoginFormPanel';
import ProjectSelect from './ProjectSelect';
import UserResourcePolicySelect from './UserResourcePolicySelect';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteOutlined,
  DownloadOutlined,
  ExclamationCircleFilled,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  App,
  Checkbox,
  Empty,
  Form,
  Input,
  Skeleton,
  Switch,
  Table,
  Tag,
  theme,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import {
  BAIAlert,
  BAIButton,
  BAIDomainSelect,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAIQuestionIconWithTooltip,
  BAIRowWrapWithDividers,
  BAIText,
  useBAILogger,
  useBAISignedRequestWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, {
  Suspense,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchQuery,
  graphql,
  useMutation,
  useRelayEnvironment,
} from 'react-relay';

// ─── Constants ───────────────────────────────────────────────────────────────

const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const statusToV2: Record<string, UserStatusV2> = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  'before-verification': 'BEFORE_VERIFICATION',
  deleted: 'DELETED',
};

const roleToV2: Record<string, UserRoleV2> = {
  user: 'USER',
  admin: 'ADMIN',
  superadmin: 'SUPERADMIN',
  monitor: 'MONITOR',
};

// Column aliases, the template, parseBoolean, and the header-recognition /
// required-column / row-extraction helpers live in ../helper/bulkUserCSV so the
// export-CSV handling can be unit tested in isolation.

// ─── Types ───────────────────────────────────────────────────────────────────

interface GlobalDefaults {
  domainName: string;
  groupIds: string[];
  resourcePolicy: string;
  description: string;
  defaultPassword: string;
  needPasswordChange: boolean;
}

interface ValidatedRow {
  key: number;
  lineNumber: number;
  email: string;
  username: string;
  password: string;
  fullName: string;
  role: string;
  status: string;
  domainName: string;
  description: string;
  needPasswordChange: boolean;
  resourcePolicy: string;
  projectName: string;
  fromDefaults: Record<string, true>;
  fieldErrors: Record<string, string>;
  isValid: boolean;
}

interface FailedUserRow {
  index: number;
  username: string;
  email: string;
  message: string;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface BulkCreateUserFromCSVModalProps extends Omit<
  BAIModalProps,
  'footer' | 'onCancel' | 'title' | 'afterClose'
> {
  onRequestClose: (success: boolean) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const BulkCreateUserFromCSVModal: React.FC<BulkCreateUserFromCSVModalProps> = ({
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const currentDomainName = useCurrentDomainValue();
  const baiRequest = useBAISignedRequestWithPromise();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [rawRows, setRawRows] = useState<RawUserRow[]>([]);
  // Canonical names of the columns actually present in the uploaded CSV header.
  // Drives which columns appear in the preview table and which optional fields
  // are sent to the mutation — fields whose column is absent are left to the
  // global defaults or sent as null, never fabricated.
  const [presentColumns, setPresentColumns] = useState<
    Set<CanonicalUserColumn>
  >(new Set());
  const [globalDefaults, setGlobalDefaults] = useState<GlobalDefaults>({
    domainName: currentDomainName,
    groupIds: [],
    resourcePolicy: 'default',
    description: '',
    defaultPassword: '',
    needPasswordChange: false,
  });
  const [onlyErrors, setOnlyErrors] = useState(false);
  // Dynamically fetched from /export/reports/users — maps localized field names
  // to import canonical names, enabling export CSV round-trips regardless of locale.
  const [dynamicColumnAliases, setDynamicColumnAliases] = useState<
    Record<string, string>
  >({});
  const [failedRows, setFailedRows] = useState<FailedUserRow[]>([]);
  // The server's actual created count from the last partial-failure submit.
  // Not derived from client stats — the server may reject rows the client
  // considered valid.
  const [createdCount, setCreatedCount] = useState(0);
  // All active groups for the current domain, used to map project name <-> id.
  // The UI (preview, selectors) works with names; only the mutation uses ids.
  const [groupList, setGroupList] = useState<
    ReadonlyArray<{ id: string; name: string }>
  >([]);
  // Whether the group list for the current global-defaults domain has finished
  // loading. Project-name validation is skipped until this is true so rows are
  // not transiently flagged as "unknown project" while the fetch is in flight.
  const [groupsLoaded, setGroupsLoaded] = useState(false);
  // Keypairs of the just-created users, shown in a download modal on success
  // (full or partial) — mirroring the single-user create flow.
  // adminBulkCreateUsersWithKeypairV2 returns each keypair's one-time secret
  // key directly in the payload; no follow-up fetch is needed.
  const [createdKeypairs, setCreatedKeypairs] =
    useState<GeneratedKeypairListModalFragment$key | null>(null);

  const relayEnvironment = useRelayEnvironment();

  const [commitBulkCreateUsers, isInFlight] =
    useMutation<BulkCreateUserFromCSVModalMutation>(graphql`
      mutation BulkCreateUserFromCSVModalMutation(
        $input: BulkCreateUserV2Input!
      ) {
        adminBulkCreateUsersWithKeypairV2(input: $input) {
          created {
            keypair {
              ...GeneratedKeypairListModalFragment
            }
          }
          failed {
            index
            username
            email
            message
          }
        }
      }
    `);

  // Imperative query used to resolve project name <-> group id. Loaded into
  // state whenever the domain changes so the preview can display names and the
  // mutation can convert them to ids.
  const groupsQuery = graphql`
    query BulkCreateUserFromCSVModalGroupsQuery(
      $domain_name: String
      $type: [String]
    ) {
      groups(domain_name: $domain_name, is_active: true, type: $type) {
        id
        name
      }
    }
  `;

  const loadGroups = useEffectEvent((domainName: string) => {
    setGroupsLoaded(false);
    fetchQuery<BulkCreateUserFromCSVModalGroupsQuery>(
      relayEnvironment,
      groupsQuery,
      { domain_name: domainName, type: ['GENERAL', 'MODEL_STORE'] },
      { fetchPolicy: 'store-or-network' },
    )
      .toPromise()
      .then((result) => {
        setGroupList(
          _.compact(result?.groups).flatMap((g) =>
            g.id ? [{ id: g.id, name: g.name ?? g.id }] : [],
          ),
        );
        // Only mark loaded on success — on failure leave validation disabled so
        // we degrade to the prior behaviour instead of flagging every project.
        setGroupsLoaded(true);
      })
      .catch((err) => {
        logger.error('Failed to load groups for name resolution', err);
      });
  });

  useEffect(() => {
    loadGroups(globalDefaults.domainName);
  }, [globalDefaults.domainName]);

  const loadDynamicAliases = useEffectEvent(() => {
    baiRequest({ method: 'GET', url: '/export/reports/users' })
      .then(
        (res: {
          report?: { fields?: Array<{ key: string; name: string }> };
        }) => {
          setDynamicColumnAliases(
            buildDynamicColumnAliases(res?.report?.fields ?? []),
          );
        },
      )
      .catch(() => {
        // Silently ignore — static aliases cover the common cases
      });
  });

  useEffect(() => {
    loadDynamicAliases();
  }, []);

  // ── Derived state (React Compiler handles memoization) ──────────────────

  // Merge static + dynamic aliases; dynamic aliases from the server's localized
  // field names override static ones so export CSV round-trips work in any locale.
  const columnAliases = mergeColumnAliases(dynamicColumnAliases);

  const idToName = _.fromPairs(groupList.map((g) => [g.id, g.name]));
  const nameToId = _.fromPairs(groupList.map((g) => [g.name, g.id]));

  const emailCount = _.countBy(rawRows, (r) => r.email.trim().toLowerCase());

  const validatedRows: ValidatedRow[] = rawRows.map((raw, index) => {
    const fromDefaults: Record<string, true> = {};

    // Only the string-valued global defaults are applied this way. Constraining
    // the key prevents passing a boolean/array default (e.g. needPasswordChange,
    // groupIds), where String(...) would yield a misleading "false"/joined-ids
    // value.
    const applyDefault = (
      rawVal: string,
      key: 'domainName' | 'resourcePolicy' | 'description',
    ): string => {
      if (rawVal.trim()) return rawVal.trim();
      const def = globalDefaults[key];
      if (def) {
        fromDefaults[key] = true;
        return def;
      }
      return '';
    };

    const email = raw.email.trim();
    const username = raw.username.trim();
    const rawPassword = raw.password.trim();
    const password = rawPassword || globalDefaults.defaultPassword.trim();
    const fullName = raw.full_name.trim();
    const role = (raw.role.trim() || 'user').toLowerCase();
    const status = (raw.status.trim() || 'active').toLowerCase();
    const domainName = applyDefault(raw.domain_name, 'domainName');
    const resourcePolicy =
      applyDefault(raw.resource_policy, 'resourcePolicy') || 'default';
    const description = applyDefault(raw.description, 'description');
    // need_password_change: per-row CSV value when the column is present,
    // otherwise the global default. Mark as a default-sourced value so the
    // preview can render it muted.
    const needPasswordChange = presentColumns.has('need_password_change')
      ? parseBoolean(raw.need_password_change)
      : globalDefaults.needPasswordChange;
    if (!presentColumns.has('need_password_change')) {
      fromDefaults.needPasswordChange = true;
    }
    // Project: per-row name from CSV; empty rows fall back to global defaults at submit time.
    const projectName = raw.project.trim();
    if (!projectName && globalDefaults.groupIds.length > 0) {
      fromDefaults.project = true;
    }

    const fieldErrors: Record<string, string> = {};

    if (!email) {
      fieldErrors.email = t('credential.validation.CSVEmailRequired');
    } else if (!EMAIL_PATTERN.test(email)) {
      fieldErrors.email = t('credential.WrongEmail');
    } else if (emailCount[email.toLowerCase()] > 1) {
      fieldErrors.email = t('credential.validation.CSVDuplicateEmail');
    }

    if (!username) {
      fieldErrors.username = t('credential.validation.CSVUserNameRequired');
    } else if (username.length > 64) {
      fieldErrors.username = t('credential.validation.CSVUserNameTooLong');
    }

    if (!password) {
      fieldErrors.password = t('credential.validation.CSVPasswordRequired');
    } else if (!passwordPattern.test(password)) {
      fieldErrors.password = t('webui.menu.InvalidPasswordMessage');
    }

    if (!(role in roleToV2)) {
      fieldErrors.role = t('credential.validation.CSVInvalidRole', { role });
    }
    if (!(status in statusToV2)) {
      fieldErrors.status = t('credential.validation.CSVInvalidStatus', {
        status,
      });
    }

    // Project: a per-row project name must resolve to a real group, otherwise
    // the user would be created with no (or the wrong) project membership and
    // the admin would never know. The group list is loaded only for the
    // global-defaults domain (loadGroups), so a row whose domain differs cannot
    // be validated against it — flag those too instead of resolving against the
    // wrong domain's groups. Skip while groups are still loading to avoid
    // transient false errors.
    if (projectName) {
      const sameDomain =
        !domainName || domainName === globalDefaults.domainName;
      if (!sameDomain || (groupsLoaded && !nameToId[projectName])) {
        fieldErrors.project = t('credential.validation.CSVUnknownProject', {
          project: projectName,
        });
      }
    }

    return {
      key: index,
      lineNumber: index + 1,
      email,
      username,
      password,
      fullName,
      role,
      status,
      domainName,
      resourcePolicy,
      description,
      needPasswordChange,
      projectName,
      fromDefaults,
      fieldErrors,
      isValid: Object.keys(fieldErrors).length === 0,
    };
  });

  const stats = {
    total: validatedRows.length,
    valid: validatedRows.filter((r) => r.isValid).length,
    withErrors: validatedRows.filter((r) => !r.isValid).length,
  };

  // Categorised error summary
  const missingRequired = validatedRows.filter(
    (r) => !r.email || !r.username || !r.password,
  ).length;
  // Categorise off the same conditions the validator uses above (email/role/
  // status/project checks), not by string-matching the localised error
  // message — that breaks in every non-English locale.
  const invalidEmail = validatedRows.filter(
    (r) => r.email && !EMAIL_PATTERN.test(r.email),
  ).length;
  const duplicateEmail = validatedRows.filter(
    (r) =>
      r.email &&
      EMAIL_PATTERN.test(r.email) &&
      emailCount[r.email.toLowerCase()] > 1,
  ).length;
  const invalidPassword = validatedRows.filter(
    (r) => r.password && r.fieldErrors.password,
  ).length;
  const invalidValue = validatedRows.filter(
    (r) => r.fieldErrors.role || r.fieldErrors.status || r.fieldErrors.project,
  ).length;

  const errorCategories = [
    {
      key: 'missingRequired',
      label: t('credential.ErrorMissingRequired'),
      count: missingRequired,
    },
    {
      key: 'invalidEmail',
      label: t('credential.ErrorInvalidEmail'),
      count: invalidEmail,
    },
    {
      key: 'duplicateEmail',
      label: t('credential.ErrorDuplicateEmail'),
      count: duplicateEmail,
    },
    {
      key: 'invalidPassword',
      label: t('credential.ErrorInvalidPassword'),
      count: invalidPassword,
    },
    {
      key: 'invalidValue',
      label: t('credential.ErrorInvalidValue'),
      count: invalidValue,
    },
  ].filter((c) => c.count > 0);

  const displayRows = onlyErrors
    ? validatedRows.filter((r) => !r.isValid)
    : validatedRows;

  const canSubmit = stats.total > 0 && stats.withErrors === 0;
  const hasFile = fileName !== null;
  const hasFailures = failedRows.length > 0;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const resetState = () => {
    setFileName(null);
    setRawRows([]);
    setPresentColumns(new Set());
    setOnlyErrors(false);
    setFailedRows([]);
    setCreatedCount(0);
    setCreatedKeypairs(null);
  };

  const loadCSVText = (name: string, text: string) => {
    let records: Record<string, string>[];
    try {
      records = parseCSV(text);
    } catch {
      message.error(t('credential.validation.CSVParseFailed'));
      return;
    }
    if (records.length === 0) {
      message.warning(t('credential.validation.CSVNoRows'));
      return;
    }

    // Map raw headers → canonical names (static + dynamically fetched aliases).
    // Export CSVs can carry many (and localized) column titles; we recognise the
    // subset we support and ignore the rest, so the modal works regardless of
    // how many columns the exported file happens to contain.
    const { headerMap, presentColumns: columnsInFile } = mapUserCSVColumns(
      _.keys(records[0]),
      columnAliases,
    );

    // Only email/username are blocking columns; password is validated per row,
    // so a passwordless CSV still loads (missing passwords become row errors).
    const missingColumns = findMissingRequiredColumns(columnsInFile);
    if (missingColumns.length > 0) {
      message.error(
        t('credential.validation.CSVMissingColumns', {
          columns: missingColumns.join(', '),
        }),
      );
      return;
    }

    setFileName(name);
    setRawRows(extractRawUserRows(records, headerMap));
    setPresentColumns(columnsInFile);
    setOnlyErrors(false);
    setFailedRows([]);
  };

  const handleFileInput = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    file
      .text()
      .then((text) => loadCSVText(file.name, text))
      .catch(() => {
        message.error(t('credential.validation.CSVParseFailed'));
      });
  };

  const handleDownloadTemplate = () => {
    downloadBlob(
      new Blob([TEMPLATE_CSV], { type: 'text/csv' }),
      'bulk-create-users-template.csv',
    );
  };

  const handleSubmit = async () => {
    const validRows = validatedRows.filter((r) => r.isValid);

    const users: CreateUserV2Input[] = validRows.map((r) => {
      // The UI works with project names; convert to group ids only here, at the
      // mutation boundary. Per-row CSV name takes priority over global defaults.
      let groupIds: string[] | null = null;
      if (r.projectName) {
        const resolvedId = nameToId[r.projectName];
        groupIds = resolvedId ? [resolvedId] : null;
      } else if (globalDefaults.groupIds.length > 0) {
        groupIds = globalDefaults.groupIds;
      }

      // Required (non-null) fields per CreateUserV2Input — always sent, taken
      // from the CSV value or a sensible client default. role/status/
      // needPasswordChange/domainName have no server-side default, so a value
      // must always be present even when the column is absent from the CSV.
      const user: CreateUserV2Input = {
        email: r.email,
        username: r.username,
        password: r.password,
        domainName: r.domainName || currentDomainName,
        needPasswordChange: r.needPasswordChange,
        status: statusToV2[r.status] || 'ACTIVE',
        role: roleToV2[r.role] || 'USER',
        // Nullable optional fields — null when neither the CSV nor a global
        // default supplies a value (the column may be absent entirely).
        fullName: r.fullName || null,
        description: r.description || null,
        groupIds,
      };

      // resourcePolicy is optional and non-null (server applies "default" when
      // omitted). Only send it when the CSV provides a value or the admin set a
      // non-default global default; otherwise omit so the server default wins.
      const resourcePolicyProvided =
        presentColumns.has('resource_policy') &&
        !r.fromDefaults.resourcePolicy &&
        !!r.resourcePolicy;
      const globalResourcePolicyOverride =
        !!globalDefaults.resourcePolicy &&
        globalDefaults.resourcePolicy !== 'default';
      if (resourcePolicyProvided || globalResourcePolicyOverride) {
        user.resourcePolicy = r.resourcePolicy;
      }

      return user;
    });

    await new Promise<void>((resolve) => {
      commitBulkCreateUsers({
        variables: { input: { users } },
        onCompleted: (res, errors) => {
          if (errors?.[0]) {
            message.error(errors[0].message || t('error.UnknownError'));
            logger.error(errors);
            resolve();
            return;
          }
          const createdList =
            res.adminBulkCreateUsersWithKeypairV2?.created ?? [];
          const createdCount = createdList.length;
          const failed = res.adminBulkCreateUsersWithKeypairV2?.failed ?? [];
          // Surface keypairs first: secret keys are one-time and must be shown
          // regardless of whether some rows failed.
          const keypairs = _.map(createdList, (created) => created.keypair);
          if (keypairs.length > 0) {
            setCreatedKeypairs(keypairs);
          }
          if (failed.length > 0) {
            setFailedRows([...failed]);
            setCreatedCount(createdCount);
            message.warning(
              t('credential.BulkCreateUserPartialFailure', {
                successCount: createdCount,
                failCount: failed.length,
              }),
            );
            logger.error('Bulk create partial failures:', failed);
            if (keypairs.length === 0) {
              onRequestClose(true);
            }
          } else {
            message.success(
              t('credential.BulkCreateUserSuccess', { count: createdCount }),
            );
            if (keypairs.length === 0) {
              onRequestClose(true);
            }
          }
          resolve();
        },
        onError: (err) => {
          message.error(t('dialog.ErrorOccurred'));
          logger.error(err);
          resolve();
        },
      });
    });
  };

  // ── Cell renderer helpers ─────────────────────────────────────────────────

  const cellStyle = (record: ValidatedRow, field: string) => ({
    style: record.fieldErrors[field]
      ? { background: token.colorErrorBg, padding: `0 ${token.paddingXS}px` }
      : { padding: `0 ${token.paddingXS}px` },
  });

  const requiredLabel = (label: string) => (
    <span>
      {label}
      <span style={{ color: token.colorError, marginLeft: 2 }}>*</span>
    </span>
  );

  const errorCell = (
    val: string,
    errorMsg: string | undefined,
    mask?: boolean,
  ) => {
    if (errorMsg) {
      return (
        <Tooltip
          title={errorMsg}
          color={token.colorError}
          styles={{ container: { color: token.colorWhite } }}
        >
          <BAIFlex gap="xs" align="center" style={{ cursor: 'default' }}>
            <ExclamationCircleFilled
              role="img"
              aria-label={errorMsg}
              style={{ color: token.colorError, flexShrink: 0 }}
            />
            {mask && val ? (
              // Never surface a raw password, even when it fails validation —
              // the error icon + tooltip already convey the problem.
              <Typography.Text
                type="danger"
                style={{ letterSpacing: '0.15em' }}
              >
                {'· · · · · · · ·'}
              </Typography.Text>
            ) : val ? (
              <BAIText type="danger" ellipsis={{ tooltip: false }}>
                {val}
              </BAIText>
            ) : (
              <Typography.Text type="secondary" italic>
                {t('dialog.warning.Required')}
              </Typography.Text>
            )}
          </BAIFlex>
        </Tooltip>
      );
    }
    if (mask && val) {
      return (
        <Typography.Text type="secondary" style={{ letterSpacing: '0.15em' }}>
          {'· · · · · · · ·'}
        </Typography.Text>
      );
    }
    return <Typography.Text>{val || '—'}</Typography.Text>;
  };

  // ── Table columns ─────────────────────────────────────────────────────────

  // Show a column for fields the uploaded CSV contains, plus any field that a
  // global default puts into effect — so the admin can always verify the value
  // that will be applied to every row at submit time. The distinction is
  // whether a default value is *always* applied:
  //   - need_password_change always sends a value (true or false), so its
  //     column is always shown.
  //   - domain and resource policy always carry a value (current-domain
  //     fallback / the server-side "default" policy), so they are shown
  //     whenever a value is selected — including the plain "default" policy.
  //   - description and project become null when empty, so their columns
  //     appear only when the admin actually configures a default.
  const showFullName = presentColumns.has('full_name');
  const showRole = presentColumns.has('role');
  const showStatus = presentColumns.has('status');
  // A need_password_change value is always applied to every row (true or
  // false), so this column is always relevant.
  const showNeedPasswordChange = true;
  // Domain is always applied (per-row, global default, or current domain),
  // so it is always relevant to preview.
  const showDomain =
    presentColumns.has('domain_name') || !!globalDefaults.domainName;
  // A resource policy value is always applied — the admin may explicitly
  // select "default" (which delegates to the server default), and that is
  // still a configured global default worth showing.
  const showResourcePolicy =
    presentColumns.has('resource_policy') || !!globalDefaults.resourcePolicy;
  const showDescription =
    presentColumns.has('description') || !!globalDefaults.description.trim();
  const showProject =
    presentColumns.has('project') || globalDefaults.groupIds.length > 0;

  const tableColumns = _.compact([
    {
      key: 'validity',
      width: 36,
      render: (_: unknown, record: ValidatedRow) =>
        record.isValid ? (
          <CheckCircleFilled style={{ color: token.colorSuccess }} />
        ) : (
          <CloseCircleFilled style={{ color: token.colorError }} />
        ),
    },
    {
      title: '#',
      dataIndex: 'lineNumber',
      key: 'lineNumber',
      width: 44,
      render: (v: number) => (
        <Typography.Text type="secondary">{v}</Typography.Text>
      ),
    },
    {
      title: requiredLabel(t('general.E-Mail')),
      dataIndex: 'email',
      key: 'email',
      width: 200,
      onCell: (record: ValidatedRow) => cellStyle(record, 'email'),
      render: (val: string, record: ValidatedRow) =>
        errorCell(val, record.fieldErrors.email),
    },
    {
      title: requiredLabel(t('credential.UserName')),
      dataIndex: 'username',
      key: 'username',
      width: 130,
      onCell: (record: ValidatedRow) => cellStyle(record, 'username'),
      render: (val: string, record: ValidatedRow) =>
        errorCell(val, record.fieldErrors.username),
    },
    {
      title: requiredLabel(t('general.Password')),
      dataIndex: 'password',
      key: 'password',
      width: 130,
      onCell: (record: ValidatedRow) => cellStyle(record, 'password'),
      render: (val: string, record: ValidatedRow) =>
        errorCell(val, record.fieldErrors.password, true),
    },
    showFullName && {
      title: t('credential.FullName'),
      dataIndex: 'fullName',
      key: 'fullName',
      width: 140,
      render: (val: string) => <Typography.Text>{val || '—'}</Typography.Text>,
    },
    showRole && {
      title: t('credential.Role'),
      dataIndex: 'role',
      key: 'role',
      width: 90,
      onCell: (record: ValidatedRow) => cellStyle(record, 'role'),
      render: (val: string, record: ValidatedRow) =>
        errorCell(val || 'user', record.fieldErrors.role),
    },
    showStatus && {
      title: t('credential.Status'),
      dataIndex: 'status',
      key: 'status',
      width: 90,
      onCell: (record: ValidatedRow) => cellStyle(record, 'status'),
      render: (val: string, record: ValidatedRow) =>
        errorCell(val || 'active', record.fieldErrors.status),
    },
    showNeedPasswordChange && {
      title: t('credential.DescRequirePasswordChange'),
      dataIndex: 'needPasswordChange',
      key: 'needPasswordChange',
      width: 110,
      render: (val: boolean, record: ValidatedRow) => (
        <Typography.Text
          type={
            record.fromDefaults.needPasswordChange ? 'secondary' : undefined
          }
        >
          {val ? t('button.Yes') : t('button.No')}
        </Typography.Text>
      ),
    },
    showDomain && {
      title: t('credential.Domain'),
      dataIndex: 'domainName',
      key: 'domainName',
      width: 120,
      onCell: (record: ValidatedRow) => cellStyle(record, 'domainName'),
      render: (val: string, record: ValidatedRow) => (
        <Typography.Text
          type={record.fromDefaults.domainName ? 'secondary' : undefined}
        >
          {val || '—'}
        </Typography.Text>
      ),
    },
    showResourcePolicy && {
      title: t('credential.UserResourcePolicy'),
      dataIndex: 'resourcePolicy',
      key: 'resourcePolicy',
      width: 140,
      onCell: (record: ValidatedRow) => cellStyle(record, 'resourcePolicy'),
      render: (val: string, record: ValidatedRow) => (
        <Typography.Text
          type={record.fromDefaults.resourcePolicy ? 'secondary' : undefined}
        >
          {val || '—'}
        </Typography.Text>
      ),
    },
    showDescription && {
      title: t('credential.Description'),
      dataIndex: 'description',
      key: 'description',
      width: 180,
      onCell: (record: ValidatedRow) => cellStyle(record, 'description'),
      render: (val: string, record: ValidatedRow) => (
        <BAIText
          type={record.fromDefaults.description ? 'secondary' : undefined}
          ellipsis={{ tooltip: true }}
        >
          {val || '—'}
        </BAIText>
      ),
    },
    showProject && {
      title: t('session.launcher.Project'),
      key: 'project',
      width: 180,
      onCell: (record: ValidatedRow) => cellStyle(record, 'project'),
      render: (_val: unknown, record: ValidatedRow) => {
        // An unresolved/unverifiable project name is a validation error — show
        // it inline (icon + tooltip) like the other validated cells.
        if (record.fieldErrors.project) {
          return errorCell(record.projectName, record.fieldErrors.project);
        }
        // Per-row project name from CSV takes priority.
        if (record.projectName) {
          return <Typography.Text>{record.projectName}</Typography.Text>;
        }
        // Fall back to global defaults (show resolved names).
        if (globalDefaults.groupIds.length === 0) {
          return <Typography.Text type="secondary">{'—'}</Typography.Text>;
        }
        const names = globalDefaults.groupIds.map((id) => idToName[id] ?? id);
        const display = names.join(', ');
        return (
          <BAIText type="secondary" ellipsis={{ tooltip: true }}>
            {display}
          </BAIText>
        );
      },
    },
  ]);

  // ── Post-submission keypair download screen ───────────────────────────────

  // On full success, replace the form with the generated-keypair download
  // modal (same UX as single-user creation). `open` is inherited from the
  // parent via baiModalProps; createdKeypairs is cleared in resetState after
  // the close animation, so the form never flashes back into view.
  if (createdKeypairs) {
    return (
      <GeneratedKeypairListModal
        {...baiModalProps}
        keypairFragment={createdKeypairs}
        afterClose={resetState}
        onRequestClose={() => onRequestClose(true)}
      />
    );
  }

  // ── Post-submission failure screen ────────────────────────────────────────

  if (hasFailures) {
    return (
      <BAIModal
        centered
        title={t('credential.BulkCreateUserFromCSV')}
        width={680}
        styles={{ body: { padding: token.paddingLG } }}
        footer={
          <BAIFlex justify="end">
            <BAIButton type="primary" onClick={() => onRequestClose(true)}>
              {t('button.Close')}
            </BAIButton>
          </BAIFlex>
        }
        afterClose={resetState}
        {...baiModalProps}
      >
        <BAIFlex direction="column" align="stretch" gap="md">
          <BAIAlert
            type="warning"
            showIcon
            description={t('credential.BulkCreateUserPartialFailure', {
              successCount: createdCount,
              failCount: failedRows.length,
            })}
          />
          <Table
            size="small"
            rowKey="index"
            scroll={{ x: 'max-content' }}
            dataSource={failedRows}
            pagination={false}
            columns={[
              {
                title: t('general.E-Mail'),
                dataIndex: 'email',
                key: 'email',
              },
              {
                title: t('credential.UserName'),
                dataIndex: 'username',
                key: 'username',
              },
              {
                title: t('dialog.error.Error'),
                dataIndex: 'message',
                key: 'message',
                render: (v: string) => (
                  <Typography.Text type="danger">{v}</Typography.Text>
                ),
              },
            ]}
          />
        </BAIFlex>
      </BAIModal>
    );
  }

  // ── Main modal ────────────────────────────────────────────────────────────

  return (
    <BAIModal
      centered
      destroyOnHidden
      title={
        <BAIFlex align="center" gap="xs">
          <Typography.Title level={5} style={{ margin: 0 }}>
            {t('credential.BulkCreateUserFromCSV')}
          </Typography.Title>
          <BAIQuestionIconWithTooltip
            title={t('credential.BulkCreateUserFromCSVSubtitle')}
          />
        </BAIFlex>
      }
      width="90%"
      style={{ maxWidth: 1600 }}
      styles={{
        container: {
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        },
        body: {
          padding: 0,
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        },
        header: { paddingBottom: token.paddingSM },
      }}
      footer={
        <BAIFlex justify="end" gap="sm">
          <BAIButton onClick={() => onRequestClose(false)}>
            {t('button.Cancel')}
          </BAIButton>
          <BAIButton
            type="primary"
            icon={<PlusOutlined />}
            disabled={!canSubmit}
            loading={isInFlight}
            action={handleSubmit}
          >
            {t('credential.CreateNUsers', { count: stats.valid })}
          </BAIButton>
        </BAIFlex>
      }
      onCancel={() => onRequestClose(false)}
      afterClose={resetState}
      {...baiModalProps}
    >
      {/* Left panel — Source file + Global defaults */}
      <BAIFlex
        direction="column"
        align="stretch"
        gap="lg"
        style={{
          width: 340,
          flexShrink: 0,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          overflowY: 'auto',
          // The modal body already supplies vertical padding (BAIModal sets
          // paddingTop/Bottom to paddingMD); only add the matching horizontal
          // padding here so the content sits evenly inset on all sides.
          padding: token.paddingMD,
        }}
      >
        {/* ── Source file section ── */}
        <BAIFlex direction="column" align="stretch" gap="sm">
          <BAIFlex align="center" gap="xs">
            <Typography.Title level={5} style={{ margin: 0 }}>
              {t('credential.SourceFile')}
            </Typography.Title>
            <BAIQuestionIconWithTooltip
              title={t('credential.SourceFileHint')}
            />
          </BAIFlex>

          {/* Hidden input backing the "Replace File" button (clicked via ref). */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              handleFileInput(e.target.files);
              // Reset so re-selecting the same file fires onChange again.
              e.target.value = '';
            }}
          />

          {/* File chip (loaded) or dragger (empty) */}
          {hasFile ? (
            <BAIFlex
              direction="column"
              align="stretch"
              gap="xs"
              style={{
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadius,
                background: token.colorFillQuaternary,
                padding: `${token.paddingSM}px ${token.paddingMD}px`,
              }}
            >
              {/* Row 1: icon + filename + row count */}
              <BAIFlex gap="sm" align="center">
                <BAIFlex
                  justify="center"
                  align="center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: token.borderRadius,
                    background: token.colorPrimaryBg,
                    color: token.colorPrimary,
                    fontSize: token.fontSizeLG,
                    flexShrink: 0,
                  }}
                >
                  <FileTextOutlined />
                </BAIFlex>
                <BAIFlex
                  direction="column"
                  align="start"
                  style={{ minWidth: 0, flex: 1 }}
                >
                  <BAIText
                    strong
                    ellipsis={{ tooltip: true }}
                    style={{ maxWidth: '100%' }}
                  >
                    {fileName}
                  </BAIText>
                </BAIFlex>
              </BAIFlex>
              {/* Row 2: Replace / Remove buttons */}
              <BAIFlex gap="xs">
                <BAIButton
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t('credential.ReplaceFile')}
                </BAIButton>
                <BAIButton
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={resetState}
                >
                  {t('credential.RemoveFile')}
                </BAIButton>
              </BAIFlex>
            </BAIFlex>
          ) : (
            <Upload.Dragger
              accept=".csv,text/csv"
              showUploadList={false}
              beforeUpload={(file) => {
                file
                  .text()
                  .then((text) => loadCSVText(file.name, text))
                  .catch(() => {
                    message.error(t('credential.validation.CSVParseFailed'));
                  });
                return false;
              }}
              style={{ background: token.colorFillQuaternary }}
            >
              <BAIFlex
                justify="center"
                style={{
                  fontSize: 40,
                  color: token.colorPrimary,
                  lineHeight: 1,
                  marginBottom: token.marginSM,
                }}
              >
                <FileTextOutlined />
              </BAIFlex>
              <Typography.Text
                style={{ display: 'block', marginBottom: token.marginXXS }}
              >
                {t('credential.UploadCSVFile')}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                {t('credential.CSVOneRowPerUser')}
              </Typography.Text>
            </Upload.Dragger>
          )}

          {/* Action buttons */}
          <BAIFlex gap="xs" wrap="wrap">
            <BAIButton
              size="small"
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
            >
              {t('credential.DownloadCSVTemplate')}
            </BAIButton>
          </BAIFlex>
        </BAIFlex>

        {/* ── Global defaults section ── */}
        <BAIFlex direction="column" align="stretch" gap="sm">
          <BAIFlex align="center" gap="xs">
            <Typography.Title level={5} style={{ margin: 0 }}>
              {t('credential.GlobalDefaults')}
            </Typography.Title>
            <BAIQuestionIconWithTooltip
              title={t('credential.GlobalDefaultsHint')}
            />
          </BAIFlex>

          <Form layout="vertical" requiredMark={false} component={false}>
            <Form.Item
              label={t('credential.Domain')}
              style={{ marginBottom: token.marginSM }}
            >
              <Suspense fallback={<Skeleton.Input active block />}>
                <BAIDomainSelect
                  value={globalDefaults.domainName}
                  onChange={(v) => {
                    setGlobalDefaults((prev) => ({
                      ...prev,
                      domainName: v ? String(v) : '',
                      groupIds: [],
                    }));
                  }}
                  style={{ width: '100%' }}
                />
              </Suspense>
            </Form.Item>

            <Form.Item
              label={t('session.launcher.Project')}
              style={{ marginBottom: token.marginSM }}
            >
              <Suspense
                key={globalDefaults.domainName}
                fallback={<Skeleton.Input active block />}
              >
                <ProjectSelect
                  key={globalDefaults.domainName}
                  mode="multiple"
                  domain={globalDefaults.domainName}
                  disableDefaultFilter
                  lockedProjectTypes={['MODEL_STORE']}
                  value={
                    globalDefaults.groupIds.length > 0
                      ? globalDefaults.groupIds
                      : []
                  }
                  onChange={(v) =>
                    setGlobalDefaults((prev) => ({
                      ...prev,
                      groupIds: Array.isArray(v) ? (v as string[]) : [],
                    }))
                  }
                  placeholder={t('credential.NoDefaultPlaceholder')}
                  style={{ width: '100%' }}
                />
              </Suspense>
            </Form.Item>

            <Form.Item
              label={t('credential.UserResourcePolicy')}
              style={{ marginBottom: token.marginSM }}
            >
              <Suspense fallback={<Skeleton.Input active block />}>
                <UserResourcePolicySelect
                  value={globalDefaults.resourcePolicy}
                  onChange={(v) =>
                    setGlobalDefaults((prev) => ({
                      ...prev,
                      // Defensive: keep it empty rather than storing the
                      // string "undefined" if no value comes through.
                      resourcePolicy: v ? String(v) : '',
                    }))
                  }
                  placeholder={t('credential.NoDefaultPlaceholder')}
                  style={{ width: '100%' }}
                />
              </Suspense>
            </Form.Item>

            <Form.Item
              label={t('general.Password')}
              style={{ marginBottom: token.marginSM }}
            >
              <Input.Password
                // "new-password" takes the modal out of the browser's
                // login-form heuristic, so Chrome stops autofilling saved
                // credentials here and into the adjacent resource-policy
                // combobox it would otherwise treat as the username field.
                autoComplete="new-password"
                value={globalDefaults.defaultPassword}
                onChange={(e) =>
                  setGlobalDefaults((prev) => ({
                    ...prev,
                    defaultPassword: e.target.value,
                  }))
                }
                placeholder={t('credential.NoDefaultPlaceholder')}
              />
            </Form.Item>

            <Form.Item
              label={t('credential.DescRequirePasswordChange')}
              tooltip={t('credential.TooltipForRequirePasswordChange')}
              style={{ marginBottom: token.marginSM }}
            >
              <Checkbox
                checked={globalDefaults.needPasswordChange}
                onChange={(e) =>
                  setGlobalDefaults((prev) => ({
                    ...prev,
                    needPasswordChange: e.target.checked,
                  }))
                }
              >
                {t('general.Enable')}
              </Checkbox>
            </Form.Item>

            <Form.Item
              label={t('credential.Description')}
              style={{ marginBottom: 0 }}
            >
              <Input.TextArea
                value={globalDefaults.description}
                onChange={(e) =>
                  setGlobalDefaults((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder={t('credential.NoDefaultPlaceholder')}
                rows={2}
              />
            </Form.Item>
          </Form>
        </BAIFlex>
      </BAIFlex>

      {/* Right panel — Preview & validation */}
      <BAIFlex
        direction="column"
        align="stretch"
        gap="md"
        style={{
          flex: 1,
          minWidth: 0,
          overflowY: 'auto',
          padding: token.paddingMD,
        }}
      >
        <BAIFlex align="center" gap="xs">
          <Typography.Title level={5} style={{ margin: 0 }}>
            {t('credential.PreviewAndValidation')}
          </Typography.Title>
          <BAIQuestionIconWithTooltip
            title={t('credential.ReviewBeforeCreating')}
          />
        </BAIFlex>

        {hasFile ? (
          <>
            {/* Stats bar */}
            <BAIFlex align="center" justify="between" gap="md" wrap="wrap">
              <BAIRowWrapWithDividers
                rowGap={token.marginLG}
                columnGap={token.marginLG}
                dividerColor={token.colorBorder}
                dividerInset={token.marginXS}
                dividerWidth={token.lineWidth}
              >
                <BAIPanelItem
                  title={t('credential.RowsParsed')}
                  value={stats.total}
                  color={token.colorText}
                  style={{ minWidth: 60 }}
                />
                <BAIPanelItem
                  title={t('credential.ReadyToCreate')}
                  value={stats.valid}
                  color={token.colorSuccess}
                  style={{ minWidth: 60 }}
                />
                <BAIPanelItem
                  title={t('credential.WithErrors')}
                  value={stats.withErrors}
                  color={token.colorError}
                  style={{ minWidth: 60 }}
                />
              </BAIRowWrapWithDividers>
              <BAIFlex gap="xs" align="center">
                <Switch
                  size="small"
                  checked={onlyErrors}
                  onChange={setOnlyErrors}
                  disabled={stats.withErrors === 0}
                />
                <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                  {t('credential.OnlyShowErrors')}
                </Typography.Text>
              </BAIFlex>
            </BAIFlex>

            {/* Error summary */}
            {stats.withErrors > 0 ? (
              <BAIFlex
                direction="column"
                align="stretch"
                gap="xs"
                style={{
                  border: `1px solid ${token.colorErrorBorder}`,
                  borderRadius: token.borderRadius,
                  background: token.colorErrorBg,
                  padding: `${token.paddingSM}px ${token.paddingMD}px`,
                }}
              >
                <BAIFlex gap="xs" align="center">
                  <CloseCircleFilled style={{ color: token.colorError }} />
                  <Typography.Text strong style={{ color: token.colorError }}>
                    {t('credential.NOfMRowsError', {
                      errorCount: stats.withErrors,
                      total: stats.total,
                    })}
                  </Typography.Text>
                </BAIFlex>
                <BAIFlex gap="xs" align="center" wrap="wrap">
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: token.fontSizeSM, flexShrink: 0 }}
                  >
                    {t('credential.IssuesFound')}
                  </Typography.Text>
                  {errorCategories.map((cat) => (
                    <Tag
                      key={cat.key}
                      color="error"
                      style={{ fontSize: token.fontSizeSM, margin: 0 }}
                    >
                      {cat.label} · {cat.count}
                    </Tag>
                  ))}
                </BAIFlex>
              </BAIFlex>
            ) : (
              <BAIAlert
                type="success"
                showIcon
                description={t('credential.AllRowsValid', {
                  count: stats.total,
                })}
              />
            )}

            {/* Preview table */}
            <Table<ValidatedRow>
              size="small"
              rowKey="key"
              dataSource={displayRows}
              columns={tableColumns}
              pagination={false}
              scroll={{ x: 'max-content' }}
              rowClassName={(record) =>
                record.isValid ? '' : 'bulk-csv-error-row'
              }
            />
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('credential.NoFileLoaded')}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        )}
      </BAIFlex>
    </BAIModal>
  );
};

export default BulkCreateUserFromCSVModal;
