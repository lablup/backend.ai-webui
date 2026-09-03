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
export type AstryxBadgeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'blue' | 'cyan' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow';
/** Astryx `Token` `color` union (core 0.3.0). */
export type AstryxTokenColor = 'default' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'cyan' | 'blue' | 'purple' | 'pink' | 'gray';
/**
 * Brand-accent replacement for `<Tag color={token.colorPrimary}>` sites
 * (AdminUserCredentialList, KeypairInfoModal ×2). The Backend.AI brand accent
 * is a green; Badge's closed enum cannot take the exact token, so the brand
 * hue is fixed here as a single named decision (policy class 4).
 */
export declare const PRIMARY_TAG_VARIANT: AstryxBadgeVariant;
/**
 * Map any antd `Tag color` value (status preset, palette preset, `-inverse`
 * preset, BUI SemanticColor, or an arbitrary runtime string) to an Astryx
 * `Badge` variant. Unknown values drop to `'neutral'` (policy class 5).
 */
export declare const badgeVariantForTagColor: (color?: string | null) => AstryxBadgeVariant;
/**
 * Same lookup for closable tags that become Astryx `Token` (its `color` enum
 * differs from Badge's). Unknown values drop to `'default'`.
 */
export declare const tokenColorForTagColor: (color?: string | null) => AstryxTokenColor;
/**
 * Domain state → Badge variant. One entry per status vocabulary observed in
 * the census; keys are the exact enum/string values the API emits (both V1
 * kebab-case and V2 UPPERCASE where both are still alive).
 */
export declare const STATUS_BADGE_VARIANT: {
    /** ComputeSession(V2) status — unifies SessionStatusTag + BAISessionNodesV2. */
    readonly session: {
        readonly PENDING: "neutral";
        readonly SCHEDULED: "info";
        readonly RESTARTING: "info";
        readonly PREPARING: "info";
        readonly PREPARED: "info";
        readonly CREATING: "info";
        readonly PULLING: "info";
        readonly RUNNING: "success";
        readonly DEPRIORITIZING: "warning";
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
        readonly 'creation-failed': "error";
        readonly 'no-available-instances': "error";
    };
    /** Session type — category colors (BAISessionTypeTag[V2]). geekblue→blue. */
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
    /** Model-service deployment status (BAIDeploymentStatusTag). */
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
    /** Replica health/lifecycle status (ReplicaStatusTag). */
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
    /** Agent status (AgentStatusTag, AgentList). */
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
    /** Model-service validation status (ValidationStatusTag). */
    readonly validation: {
        readonly default: "neutral";
        readonly finished: "neutral";
        readonly processing: "info";
        readonly error: "error";
        readonly success: "success";
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
    /** VFolder permission letters (VFolderPermissionTag, SummaryItemInvitation). */
    readonly vfolderPermission: {
        readonly r: "green";
        readonly w: "blue";
        readonly d: "red";
        readonly o: "orange";
    };
};
export type StatusDomain = keyof typeof STATUS_BADGE_VARIANT;
/**
 * Look up the Badge variant for a domain state. Unknown/unlisted states
 * (including Relay's `'%future added value'`) drop to `'neutral'`
 * (policy class 5) — matching today's behaviour where unmapped statuses
 * render an uncolored antd Tag.
 */
export declare const badgeVariantForStatus: (domain: StatusDomain, value?: string | null) => AstryxBadgeVariant;
/** `Token`-flavoured domain lookup for closable/removable tag call sites. */
export declare const tokenColorForStatus: (domain: StatusDomain, value?: string | null) => AstryxTokenColor;
