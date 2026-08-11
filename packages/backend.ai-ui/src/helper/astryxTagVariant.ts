/**
 * Repo-global antd `Tag color` → Astryx variant lookup (astryx migration
 * prefactor, ticket 13).
 *
 * Page-group migration tickets convert `<Tag color={X}>` call sites to Astryx
 * `Badge` (read-only pill), `Token` (closable/removable pill) or `StatusDot`
 * by routing X through THIS module only. Do not invent per-page color maps —
 * 65 files each inventing their own is the failure mode this module prevents.
 *
 * Astryx target vocabularies (closed enums, discovered via
 * `astryx component Badge|Token|StatusDot`, core 0.3.0):
 * - Badge.variant:  neutral | info | success | warning | error |
 *                   blue | cyan | green | orange | pink | purple | red | teal | yellow
 * - Token.color:    default | red | orange | yellow | green | teal | cyan |
 *                   blue | purple | pink | gray
 * - StatusDot.variant: success | warning | error | accent | neutral
 *
 * ## Unmapped-value policy (per value class, binding for tickets 15–24)
 *
 * 1. antd status presets (`success`/`processing`/`error`/`warning`/`default`)
 *    → same-name semantic variant; `processing` → `info` (Astryx has no
 *    processing variant; spinner icons stay at the call site).
 * 2. antd palette presets (`blue`, `green`, …) → same-hue variant. Hues Astryx
 *    does not have merge into the nearest neighbour: `geekblue`→`blue`,
 *    `gold`→`yellow`, `magenta`→`pink`, `volcano`→`orange`, `lime`→`green`.
 * 3. `*-inverse` presets → base hue. The filled/inverse emphasis axis does not
 *    exist on Astryx Badge and is DROPPED (defaults-first; MIGRATION-SPEC §0
 *    simplicity policy — do not rebuild it).
 * 4. Theme token refs (`token.colorPrimary` at 3 sites: main-access-key tags)
 *    → `PRIMARY_TAG_VARIANT` (brand hue as a named variant). Arbitrary theme
 *    routing is NOT supported; if the brand hue changes, update that one const.
 * 5. Arbitrary hex / CSS color names / runtime metadata strings (e.g. image
 *    metadata `label.color`, AgentList `lightblue`) → normalized against the
 *    preset table; anything still unknown DROPS to `neutral`/`default`.
 *    Arbitrary color values are inexpressible in Astryx's closed enums and are
 *    never routed through the theme layer.
 * 6. BUI `SemanticColor` (`success|info|warning|error|default`) values are
 *    accepted directly (`info`→`info`, `default`→`neutral`).
 *
 * Domain status maps below unify the per-file maps that exist today
 * (SessionStatusTag, BAISessionNodesV2, BAIDeploymentStatusTag, BAIRouteNodes,
 * ReplicaStatusTag, VFolderNodes(V2), BAILoginHistoryTable, AgentStatusTag,
 * ScopedRolePermissionCard, …). Where two legacy maps disagreed
 * (session PENDING: V1 `blue` vs V2 `default`) the newer V2 mapping wins and
 * the transitional hues are expressed with the semantic `info` variant, per
 * Astryx Badge guidance (loud semantic variants only for states needing
 * attention; quiet `neutral` for terminal/default states).
 */

/** Astryx `Badge` `variant` union (core 0.3.0). */
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

/** Astryx `Token` `color` union (core 0.3.0). */
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

/**
 * Brand-accent replacement for `<Tag color={token.colorPrimary}>` sites
 * (AdminUserCredentialList, KeypairInfoModal ×2). The Backend.AI brand accent
 * is a green; Badge's closed enum cannot take the exact token, so the brand
 * hue is fixed here as a single named decision (policy class 4).
 */
export const PRIMARY_TAG_VARIANT: AstryxBadgeVariant = 'green';

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
 * `Badge` variant. Unknown values drop to `'neutral'` (policy class 5).
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
 * Same lookup for closable tags that become Astryx `Token` (its `color` enum
 * differs from Badge's). Unknown values drop to `'default'`.
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
  /** ComputeSession(V2) status — unifies SessionStatusTag + BAISessionNodesV2. */
  session: {
    PENDING: 'neutral',
    SCHEDULED: 'info',
    RESTARTING: 'info',
    PREPARING: 'info',
    PREPARED: 'info',
    CREATING: 'info',
    PULLING: 'info',
    RUNNING: 'success',
    DEPRIORITIZING: 'warning',
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
    'creation-failed': 'error',
    'no-available-instances': 'error',
  },
  /** Session type — category colors (BAISessionTypeTag[V2]). geekblue→blue. */
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
  /** Model-service deployment status (BAIDeploymentStatusTag). */
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
  /** Replica health/lifecycle status (ReplicaStatusTag). */
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
  /** Agent status (AgentStatusTag, AgentList). */
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
  /** Model-service validation status (ValidationStatusTag). */
  validation: {
    default: 'neutral',
    finished: 'neutral',
    processing: 'info',
    error: 'error',
    success: 'success',
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
  /** VFolder permission letters (VFolderPermissionTag, SummaryItemInvitation). */
  vfolderPermission: {
    r: 'green',
    w: 'blue',
    d: 'red',
    o: 'orange',
  },
} as const satisfies Record<string, Record<string, AstryxBadgeVariant>>;

export type StatusDomain = keyof typeof STATUS_BADGE_VARIANT;

/**
 * Look up the Badge variant for a domain state. Unknown/unlisted states
 * (including Relay's `'%future added value'`) drop to `'neutral'`
 * (policy class 5) — matching today's behaviour where unmapped statuses
 * render an uncolored antd Tag.
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

/** `Token`-flavoured domain lookup for closable/removable tag call sites. */
export const tokenColorForStatus = (
  domain: StatusDomain,
  value?: string | null,
): AstryxTokenColor =>
  BADGE_VARIANT_TO_TOKEN_COLOR[badgeVariantForStatus(domain, value)];
