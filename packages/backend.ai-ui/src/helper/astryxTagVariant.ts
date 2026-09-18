/**
 * The one colour lookup for Astryx `Badge` and `Token` (ADR 0007). The file
 * name keeps "Tag" because its input vocabulary is the antd `Tag color` set.
 *
 * Which primitive a value gets:
 * - `Badge` — a value the system changes on its own over time: lifecycle and
 *   health status, in-progress markers, Current/Latest pointers, live tickers,
 *   counts. Colour: `badgeVariantForStatus` / `badgeVariantForTagColor`.
 * - `Token` — a value that changes only when a user edits it, or a category
 *   label: names, types, permissions, versions, tags, on/off settings,
 *   recorded outcomes. Colour: `tokenColorForStatus` / `tokenColorForTagColor`.
 *
 * Do not add per-file colour maps; extend the tables here. Input policy:
 * antd status presets map to the same-name semantic variant (`processing` →
 * `info`), palette presets to the nearest Astryx hue, `*-inverse` to its base
 * hue, BUI `SemanticColor` directly (`default` → `neutral`); anything else —
 * hex, unknown CSS names — drops to `neutral` / `default`.
 */

/** Astryx `Badge` `variant` union (core 0.5.4). */
export type AstryxBadgeVariant =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'blue'
  | 'cyan'
  | 'green'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal'
  | 'yellow';

/** Astryx `Token` `color` union (core 0.5.4). */
export type AstryxTokenColor =
  | 'default'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'gray';

/** Brand-accent Token colour, used for the main-access-key marker. */
export const PRIMARY_TOKEN_COLOR: AstryxTokenColor = 'green';

/**
 * antd Tag `color` value → Astryx Badge variant.
 * Keys cover every color value observed in the census (ticket 13) plus the
 * remaining antd presets for robustness against runtime metadata strings.
 */
const TAG_COLOR_TO_BADGE_VARIANT: Record<string, AstryxBadgeVariant> = {
  // antd status presets + BUI SemanticColor
  success: 'success',
  processing: 'info',
  info: 'info',
  error: 'error',
  warning: 'warning',
  default: 'neutral',
  // antd palette presets (observed)
  blue: 'blue',
  geekblue: 'blue',
  cyan: 'cyan',
  green: 'green',
  red: 'red',
  orange: 'orange',
  purple: 'purple',
  gold: 'yellow',
  yellow: 'yellow',
  // antd palette presets (not observed in app code; kept for runtime strings)
  magenta: 'pink',
  pink: 'pink',
  lime: 'green',
  volcano: 'orange',
  // non-preset CSS color observed (AgentList gcp/google platform tag)
  lightblue: 'cyan',
};

const BADGE_VARIANT_TO_TOKEN_COLOR: Record<
  AstryxBadgeVariant,
  AstryxTokenColor
> = {
  neutral: 'default',
  info: 'blue',
  success: 'green',
  warning: 'orange',
  error: 'red',
  blue: 'blue',
  cyan: 'cyan',
  green: 'green',
  orange: 'orange',
  pink: 'pink',
  purple: 'purple',
  red: 'red',
  teal: 'teal',
  yellow: 'yellow',
};

/**
 * Map any antd `Tag color` value (status preset, palette preset, `-inverse`
 * preset, BUI SemanticColor, or an arbitrary runtime string) to an Astryx
 * `Badge` variant. Unknown values drop to `'neutral'`.
 */
export const badgeVariantForTagColor = (
  color?: string | null,
): AstryxBadgeVariant => {
  if (!color) {
    return 'neutral';
  }
  const normalized = color
    .trim()
    .toLowerCase()
    .replace(/-inverse$/, '');
  return TAG_COLOR_TO_BADGE_VARIANT[normalized] ?? 'neutral';
};

/**
 * The same lookup for a settled value drawn as a `Token`: semantic variants
 * become hues (`success`→green, `warning`→orange, `error`→red, `info`→blue,
 * `neutral`→default). Unknown values drop to `'default'`.
 */
export const tokenColorForTagColor = (
  color?: string | null,
): AstryxTokenColor =>
  BADGE_VARIANT_TO_TOKEN_COLOR[badgeVariantForTagColor(color)];

/**
 * Domain state → Badge variant. One entry per status vocabulary observed in
 * the census; keys are the exact enum/string values the API emits (both V1
 * kebab-case and V2 UPPERCASE where both are still alive).
 */
export const STATUS_BADGE_VARIANT = {
  /** ComputeSession(V2) status — unifies SessionStatusBadge + BAISessionNodesV2. */
  session: {
    PENDING: 'neutral',
    RESERVED: 'info',
    SCHEDULED: 'info',
    RESTARTING: 'info',
    PREPARING: 'info',
    PREPARED: 'info',
    CREATING: 'info',
    PULLING: 'info',
    RUNNING: 'success',
    DEPRIORITIZING: 'warning',
    PREEMPTED: 'warning',
    RESCHEDULING: 'warning',
    TERMINATING: 'warning',
    TERMINATED: 'neutral',
    CANCELLED: 'error',
    ERROR: 'error',
  },
  /** Kernel status (ConnectedKernelList). */
  kernel: {
    PREPARING: 'info',
    BUILDING: 'info',
    PULLING: 'info',
    PREPARED: 'info',
    CREATING: 'info',
    PENDING: 'success',
    RESERVED: 'success',
    SCHEDULED: 'success',
    RUNNING: 'success',
    RESTARTING: 'success',
    RESIZING: 'success',
    SUSPENDED: 'success',
    TERMINATING: 'neutral',
    TERMINATED: 'neutral',
    CANCELLED: 'neutral',
    ERROR: 'error',
  },
  /** Session `status_info` reason strings (SessionStatusDetailModal). */
  sessionStatusInfo: {
    'idle-timeout': 'success',
    'user-requested': 'success',
    scheduled: 'success',
    'self-terminated': 'success',
    'failed-to-start': 'error',
    PREEMPTED_BY_SCHEDULER: 'warning',
    RESCHEDULED: 'info',
    'preemption-reservation': 'info',
    'preempted-by-reservation': 'warning',
    'creation-failed': 'error',
    'no-available-instances': 'error',
  },
  /** Session type — category colors (BAISessionTypeToken[V2]). geekblue→blue. */
  sessionType: {
    INTERACTIVE: 'blue',
    BATCH: 'cyan',
    INFERENCE: 'purple',
  },
  /** VFolder operation status — V2 UPPERCASE + legacy V1 kebab-case. */
  vfolder: {
    READY: 'warning',
    CLONING: 'warning',
    DELETE_PENDING: 'neutral',
    DELETE_ONGOING: 'neutral',
    DELETE_COMPLETE: 'neutral',
    DELETE_ERROR: 'error',
    ready: 'warning',
    performing: 'warning',
    cloning: 'warning',
    mounted: 'warning',
    error: 'error',
    'delete-pending': 'neutral',
    'delete-ongoing': 'neutral',
    'delete-complete': 'neutral',
    'delete-error': 'error',
  },
  /** Model-service deployment status (BAIDeploymentStatusBadge). */
  deployment: {
    HEALTHY: 'success',
    READY: 'success',
    ACTIVE: 'success',
    DEPLOYING: 'info',
    SCALING: 'info',
    PENDING: 'info',
    DEGRADED: 'warning',
    UNHEALTHY: 'warning',
    STOPPING: 'warning',
    NOT_CHECKED: 'neutral',
    STOPPED: 'neutral',
    TERMINATED: 'neutral',
  },
  /** Route status incl. pre-26.4.0 merged health states (BAIRouteNodes). */
  route: {
    PROVISIONING: 'info',
    RUNNING: 'success',
    TERMINATING: 'warning',
    TERMINATED: 'neutral',
    FAILED_TO_START: 'error',
    HEALTHY: 'success',
    UNHEALTHY: 'warning',
    DEGRADED: 'warning',
    NOT_CHECKED: 'neutral',
  },
  /** Replica health/lifecycle status (ReplicaStatusBadge). */
  replica: {
    HEALTHY: 'success',
    UNHEALTHY: 'error',
    DEGRADED: 'warning',
    NOT_CHECKED: 'neutral',
    PROVISIONING: 'info',
    WARMING_UP: 'info',
    RUNNING: 'success',
    TERMINATING: 'warning',
    TERMINATED: 'neutral',
    FAILED_TO_START: 'error',
  },
  /** Agent status (AgentStatusBadge, AgentList). */
  agent: {
    ALIVE: 'success',
    LOST: 'error',
    RESTARTING: 'warning',
    TERMINATED: 'neutral',
  },
  /** Login-attempt result (BAILoginHistoryTable). */
  loginHistory: {
    SUCCESS: 'success',
    FAILED_INVALID_CREDENTIALS: 'error',
    FAILED_USER_INACTIVE: 'error',
    FAILED_BLOCKED: 'error',
    FAILED_PASSWORD_EXPIRED: 'error',
    FAILED_REJECTED_BY_HOOK: 'error',
    FAILED_SESSION_ALREADY_EXISTS: 'error',
    LOGOUT: 'neutral',
    REVOKED_BY_ADMIN: 'warning',
    REVOKED_BY_USER: 'neutral',
    EVICTED: 'warning',
    EXPIRED: 'neutral',
  },
  /** RBAC grant state (ScopedRolePermissionCard). */
  grantState: {
    full: 'success',
    partial: 'warning',
    none: 'neutral',
  },
  /** Role status / source (RoleNodes, RoleDetailDrawerContent). */
  role: {
    ACTIVE: 'success',
    INACTIVE: 'warning',
    DELETED: 'error',
    SYSTEM: 'neutral',
    CUSTOM: 'success',
  },
  /** Cloud platform / region category colors (AgentList, StorageProxyList). */
  cloudPlatform: {
    aws: 'orange',
    amazon: 'orange',
    azure: 'blue',
    gcp: 'cyan',
    google: 'cyan',
    nbp: 'green',
    naver: 'green',
    openstack: 'red',
    dgx: 'green',
    local: 'yellow',
  },
  /** Storage backend type category colors (StorageProxyList). geekblue→blue, unknown→yellow at call site. */
  storageBackend: {
    xfs: 'blue',
    ceph: 'blue',
    cephfs: 'blue',
    vfs: 'green',
    nfs: 'green',
    purestorage: 'red',
    dgx: 'green',
    spectrumscale: 'green',
    weka: 'purple',
  },
  /** VFolder permission letters (VFolderPermissionToken, SummaryItemInvitation). */
  vfolderPermission: {
    r: 'green',
    w: 'blue',
    d: 'red',
    o: 'orange',
  },
} as const satisfies Record<string, Record<string, AstryxBadgeVariant>>;

export type StatusDomain = keyof typeof STATUS_BADGE_VARIANT;

/**
 * Domain value → Badge variant. Unknown values, including Relay's
 * `'%future added value'`, drop to `'neutral'`.
 */
export const badgeVariantForStatus = (
  domain: StatusDomain,
  value?: string | null,
): AstryxBadgeVariant => {
  if (!value) {
    return 'neutral';
  }
  const map: Record<string, AstryxBadgeVariant> = STATUS_BADGE_VARIANT[domain];
  return map[value] ?? 'neutral';
};

/** Domain value → Token colour, for settled values drawn as a `Token`. */
export const tokenColorForStatus = (
  domain: StatusDomain,
  value?: string | null,
): AstryxTokenColor =>
  BADGE_VARIANT_TO_TOKEN_COLOR[badgeVariantForStatus(domain, value)];
