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
export type AstryxBadgeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'blue' | 'cyan' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow';
/** Astryx `Token` `color` union (core 0.5.4). */
export type AstryxTokenColor = 'default' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'cyan' | 'blue' | 'purple' | 'pink' | 'gray';
/** Brand-accent Token colour, used for the main-access-key marker. */
export declare const PRIMARY_TOKEN_COLOR: AstryxTokenColor;
/**
 * Map any antd `Tag color` value (status preset, palette preset, `-inverse`
 * preset, BUI SemanticColor, or an arbitrary runtime string) to an Astryx
 * `Badge` variant. Unknown values drop to `'neutral'`.
 */
export declare const badgeVariantForTagColor: (color?: string | null) => AstryxBadgeVariant;
/**
 * The same lookup for a settled value drawn as a `Token`: semantic variants
 * become hues (`success`→green, `warning`→orange, `error`→red, `info`→blue,
 * `neutral`→default). Unknown values drop to `'default'`.
 */
export declare const tokenColorForTagColor: (color?: string | null) => AstryxTokenColor;
/**
 * Domain state → Badge variant. One entry per status vocabulary observed in
 * the census; keys are the exact enum/string values the API emits (both V1
 * kebab-case and V2 UPPERCASE where both are still alive).
 */
export declare const STATUS_BADGE_VARIANT: {
    /** ComputeSession(V2) status — unifies SessionStatusBadge + BAISessionNodesV2. */
    readonly session: {
        readonly PENDING: "neutral";
        readonly RESERVED: "info";
        readonly SCHEDULED: "info";
        readonly RESTARTING: "info";
        readonly PREPARING: "info";
        readonly PREPARED: "info";
        readonly CREATING: "info";
        readonly PULLING: "info";
        readonly RUNNING: "success";
        readonly DEPRIORITIZING: "warning";
        readonly PREEMPTED: "warning";
        readonly RESCHEDULING: "warning";
        readonly TERMINATING: "warning";
        readonly TERMINATED: "neutral";
        readonly CANCELLED: "error";
        readonly ERROR: "error";
    };
    /** Kernel status (ConnectedKernelList). */
    readonly kernel: {
        readonly PREPARING: "info";
        readonly BUILDING: "info";
        readonly PULLING: "info";
        readonly PREPARED: "info";
        readonly CREATING: "info";
        readonly PENDING: "success";
        readonly RESERVED: "success";
        readonly SCHEDULED: "success";
        readonly RUNNING: "success";
        readonly RESTARTING: "success";
        readonly RESIZING: "success";
        readonly SUSPENDED: "success";
        readonly TERMINATING: "neutral";
        readonly TERMINATED: "neutral";
        readonly CANCELLED: "neutral";
        readonly ERROR: "error";
    };
    /** Session `status_info` reason strings (SessionStatusDetailModal). */
    readonly sessionStatusInfo: {
        readonly 'idle-timeout': "success";
        readonly 'user-requested': "success";
        readonly scheduled: "success";
        readonly 'self-terminated': "success";
        readonly 'failed-to-start': "error";
        readonly PREEMPTED_BY_SCHEDULER: "warning";
        readonly RESCHEDULED: "info";
        readonly 'preemption-reservation': "info";
        readonly 'preempted-by-reservation': "warning";
        readonly 'creation-failed': "error";
        readonly 'no-available-instances': "error";
    };
    /** Session type — category colors (BAISessionTypeToken[V2]). geekblue→blue. */
    readonly sessionType: {
        readonly INTERACTIVE: "blue";
        readonly BATCH: "cyan";
        readonly INFERENCE: "purple";
    };
    /** VFolder operation status — V2 UPPERCASE + legacy V1 kebab-case. */
    readonly vfolder: {
        readonly READY: "warning";
        readonly CLONING: "warning";
        readonly DELETE_PENDING: "neutral";
        readonly DELETE_ONGOING: "neutral";
        readonly DELETE_COMPLETE: "neutral";
        readonly DELETE_ERROR: "error";
        readonly ready: "warning";
        readonly performing: "warning";
        readonly cloning: "warning";
        readonly mounted: "warning";
        readonly error: "error";
        readonly 'delete-pending': "neutral";
        readonly 'delete-ongoing': "neutral";
        readonly 'delete-complete': "neutral";
        readonly 'delete-error': "error";
    };
    /** Model-service deployment status (BAIDeploymentStatusBadge). */
    readonly deployment: {
        readonly HEALTHY: "success";
        readonly READY: "success";
        readonly ACTIVE: "success";
        readonly DEPLOYING: "info";
        readonly SCALING: "info";
        readonly PENDING: "info";
        readonly DEGRADED: "warning";
        readonly UNHEALTHY: "warning";
        readonly STOPPING: "warning";
        readonly NOT_CHECKED: "neutral";
        readonly STOPPED: "neutral";
        readonly TERMINATED: "neutral";
    };
    /** Route status incl. pre-26.4.0 merged health states (BAIRouteNodes). */
    readonly route: {
        readonly PROVISIONING: "info";
        readonly RUNNING: "success";
        readonly TERMINATING: "warning";
        readonly TERMINATED: "neutral";
        readonly FAILED_TO_START: "error";
        readonly HEALTHY: "success";
        readonly UNHEALTHY: "warning";
        readonly DEGRADED: "warning";
        readonly NOT_CHECKED: "neutral";
    };
    /** Replica health/lifecycle status (ReplicaStatusBadge). */
    readonly replica: {
        readonly HEALTHY: "success";
        readonly UNHEALTHY: "error";
        readonly DEGRADED: "warning";
        readonly NOT_CHECKED: "neutral";
        readonly PROVISIONING: "info";
        readonly WARMING_UP: "info";
        readonly RUNNING: "success";
        readonly TERMINATING: "warning";
        readonly TERMINATED: "neutral";
        readonly FAILED_TO_START: "error";
    };
    /** Agent status (AgentStatusBadge, AgentList). */
    readonly agent: {
        readonly ALIVE: "success";
        readonly LOST: "error";
        readonly RESTARTING: "warning";
        readonly TERMINATED: "neutral";
    };
    /** Login-attempt result (BAILoginHistoryTable). */
    readonly loginHistory: {
        readonly SUCCESS: "success";
        readonly FAILED_INVALID_CREDENTIALS: "error";
        readonly FAILED_USER_INACTIVE: "error";
        readonly FAILED_BLOCKED: "error";
        readonly FAILED_PASSWORD_EXPIRED: "error";
        readonly FAILED_REJECTED_BY_HOOK: "error";
        readonly FAILED_SESSION_ALREADY_EXISTS: "error";
        readonly LOGOUT: "neutral";
        readonly REVOKED_BY_ADMIN: "warning";
        readonly REVOKED_BY_USER: "neutral";
        readonly EVICTED: "warning";
        readonly EXPIRED: "neutral";
    };
    /** RBAC grant state (ScopedRolePermissionCard). */
    readonly grantState: {
        readonly full: "success";
        readonly partial: "warning";
        readonly none: "neutral";
    };
    /** Role status / source (RoleNodes, RoleDetailDrawerContent). */
    readonly role: {
        readonly ACTIVE: "success";
        readonly INACTIVE: "warning";
        readonly DELETED: "error";
        readonly SYSTEM: "neutral";
        readonly CUSTOM: "success";
    };
    /** Cloud platform / region category colors (AgentList, StorageProxyList). */
    readonly cloudPlatform: {
        readonly aws: "orange";
        readonly amazon: "orange";
        readonly azure: "blue";
        readonly gcp: "cyan";
        readonly google: "cyan";
        readonly nbp: "green";
        readonly naver: "green";
        readonly openstack: "red";
        readonly dgx: "green";
        readonly local: "yellow";
    };
    /** Storage backend type category colors (StorageProxyList). geekblue→blue, unknown→yellow at call site. */
    readonly storageBackend: {
        readonly xfs: "blue";
        readonly ceph: "blue";
        readonly cephfs: "blue";
        readonly vfs: "green";
        readonly nfs: "green";
        readonly purestorage: "red";
        readonly dgx: "green";
        readonly spectrumscale: "green";
        readonly weka: "purple";
    };
    /** VFolder permission letters (VFolderPermissionToken, SummaryItemInvitation). */
    readonly vfolderPermission: {
        readonly r: "green";
        readonly w: "blue";
        readonly d: "red";
        readonly o: "orange";
    };
};
export type StatusDomain = keyof typeof STATUS_BADGE_VARIANT;
/**
 * Domain value → Badge variant. Unknown values, including Relay's
 * `'%future added value'`, drop to `'neutral'`.
 */
export declare const badgeVariantForStatus: (domain: StatusDomain, value?: string | null) => AstryxBadgeVariant;
/** Domain value → Token colour, for settled values drawn as a `Token`. */
export declare const tokenColorForStatus: (domain: StatusDomain, value?: string | null) => AstryxTokenColor;
