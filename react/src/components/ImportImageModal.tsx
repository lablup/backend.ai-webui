/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ImportImageModalEnableRegistryMutation } from '../__generated__/ImportImageModalEnableRegistryMutation.graphql';
import { ImportImageModalRegistriesQuery } from '../__generated__/ImportImageModalRegistriesQuery.graphql';
import { ImportImageModalScanImageMutation } from '../__generated__/ImportImageModalScanImageMutation.graphql';
import { App } from '../app-shim';
import {
  parseImageReferenceLine,
  resolveImageReference,
  type ImageReferenceReason,
  type RegistryRow,
  type ResolvedReference,
} from '../helper/imageReferenceParser';
import { queryWithinOpenModal } from '../helper/openModalRoot';
import { useSuspendedBackendaiClient } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import { usePainKiller } from '../hooks/usePainKiller';
import { BAIFormItemVisual } from './BAIFormItem';
import ContainerRegistryEditorModal from './ContainerRegistryEditorModal';
import { Button } from '@lablup/ui-common/Button';
import { Center } from '@lablup/ui-common/Center';
import { Link } from '@lablup/ui-common/Link';
import { List, ListItem } from '@lablup/ui-common/List';
import { HStack } from '@lablup/ui-common/Stack';
import { StatusDot } from '@lablup/ui-common/StatusDot';
import { Text } from '@lablup/ui-common/Text';
import { TextArea } from '@lablup/ui-common/TextArea';
import {
  borderVars,
  typeScaleVars,
} from '@lablup/ui-common/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAISelect,
  BAISkeleton,
  BAIUnmountAfterClose,
  filterOutNullAndUndefined,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PlusIcon } from 'lucide-react';
import {
  Suspense,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchQuery,
  graphql,
  useMutation,
  useRelayEnvironment,
} from 'react-relay';
import type { IEnvironment, PayloadError } from 'relay-runtime';

type ImportFooterState = { hasFailure: boolean };

type LineOutcome = {
  status: 'queued' | 'pending' | 'success' | 'error';
  message?: string;
};

/** One dot language for every row; the word carries what colour cannot. */
type LineStatus = {
  variant: React.ComponentProps<typeof StatusDot>['variant'];
  label: string;
  isPulsing?: boolean;
};

const registriesQuery = graphql`
  query ImportImageModalRegistriesQuery(
    $first: Int
    $after: String
    $domain: String
  ) {
    domain(name: $domain) {
      allowed_docker_registries
    }
    container_registry_nodes(first: $first, after: $after)
      @since(version: "24.09.0") {
      edges {
        node {
          id
          registry_name
          project
          url
          type
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

type RegistryConnection = NonNullable<
  ImportImageModalRegistriesQuery['response']['container_registry_nodes']
>;
type RegistryNode = NonNullable<RegistryConnection['edges']>[number];

const scanImageMutation = graphql`
  mutation ImportImageModalScanImageMutation($input: ScanImageInput!) {
    adminScanImage(input: $input) {
      item {
        id
        identity {
          canonicalName
          architecture
        }
      }
    }
  }
`;

const enableRegistryMutation = graphql`
  mutation ImportImageModalEnableRegistryMutation(
    $domain: String!
    $allowed_docker_registries: [String]!
  ) {
    modify_domain(
      name: $domain
      props: { allowed_docker_registries: $allowed_docker_registries }
    ) {
      ok
      msg
    }
  }
`;

/** A GraphQL error as the manager sends it; Relay's type drops `extensions`. */
type ManagerPayloadError = PayloadError & {
  extensions?: { code?: string };
};

const REGISTRY_PAGE_SIZE = 100;
/** Bounds the loop if a manager ever answers `hasNextPage` without advancing. */
const REGISTRY_PAGE_LIMIT = 100;

/**
 * Every registered registry, not just the first page: the prefix match below
 * is only as complete as this list, so a row past the cap would read as
 * "registry not registered". Forward cursor mode only -- see
 * `.claude/rules/graphql-pagination.md`.
 */
const fetchAllRegistries = async (
  environment: IEnvironment,
  domain: string,
): Promise<{
  nodes: Array<RegistryNode>;
  /** `null` when the manager did not say; treated as allowing everything. */
  allowedRegistries: ReadonlyArray<string> | null;
}> => {
  const nodes: Array<RegistryNode> = [];
  let allowedRegistries: ReadonlyArray<string> | null = null;
  let after: string | null = null;
  for (let page = 0; page < REGISTRY_PAGE_LIMIT; page++) {
    // Annotated: `after` is written from this very result, so an inferred
    // type would be circular (TS7022).
    const data: ImportImageModalRegistriesQuery['response'] | undefined =
      await fetchQuery<ImportImageModalRegistriesQuery>(
        environment,
        registriesQuery,
        { first: REGISTRY_PAGE_SIZE, after, domain },
        { fetchPolicy: 'network-only' },
      ).toPromise();
    if (page === 0) {
      allowedRegistries = data?.domain?.allowed_docker_registries
        ? _.compact(data.domain.allowed_docker_registries)
        : null;
    }
    const connection: RegistryConnection | null | undefined =
      data?.container_registry_nodes;
    nodes.push(..._.map(connection?.edges, (edge) => edge));
    if (
      !connection?.pageInfo?.hasNextPage ||
      !connection?.pageInfo?.endCursor
    ) {
      break;
    }
    after = connection.pageInfo.endCursor;
  }
  return { nodes, allowedRegistries };
};

export interface ImportImageModalProps extends Omit<BAIModalProps, 'onOk'> {
  onRequestClose: () => void;
  /** Canonicals the manager accepted, in submission order. */
  onAdded?: (added: Array<string>) => void;
}

const ARCHITECTURES = ['x86_64', 'aarch64'] as const;

const MODAL_MAX_HEIGHT = 'calc(100dvh - var(--spacing-12) * 2)';

/** The catalog page that lists a repository's tags, for a tag-less NGC paste. */
const ngcTagsUrl = (remotePath: string | null) => {
  const segments = (remotePath ?? '').split('/');
  if (segments.length < 2) return null;
  const [org, ...rest] = segments;
  const name = rest.pop();
  return `https://catalog.ngc.nvidia.com/orgs/${org}/${rest[0] ?? '-'}/containers/${name}/-/tags`;
};

const styles = stylex.create({
  row: {
    // Astryx ListItem's :last-child divider suppression is a shorthand that
    // loses to its own longhands in StyleX -- re-suppress it here (FR-3893).
    alignItems: 'flex-start',
    borderBlockEndWidth: {
      default: borderVars['--border-width'],
      ':last-child': 0,
    },
  },
  // Centres the 8px dot on the label's first line, however far the
  // description below it wraps.
  marker: {
    minHeight: `calc(${typeScaleVars['--text-body-size']} * ${typeScaleVars['--text-body-leading']})`,
  },
  // A canonical has no break opportunity of its own, so without this it
  // overruns the row and collides with the end-aligned actions.
  canonical: {
    overflowWrap: 'anywhere',
  },
});

const ImportImageModalContent: React.FC<{
  onRequestClose: () => void;
  onAdded?: (added: Array<string>) => void;
  isSubmitting: boolean;
  onSubmittingChange: (isSubmitting: boolean) => void;
  /** Keys this open's registry list, so a reopen never reuses an earlier one. */
  openedAt: number;
  /** The modal's own footer runs the import, so the content hands it over. */
  submitRef: React.RefObject<(() => void) | null>;
  onFooterStateChange: (state: ImportFooterState) => void;
}> = ({
  onRequestClose,
  onAdded,
  isSubmitting,
  onSubmittingChange,
  openedAt,
  submitRef,
  onFooterStateChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const painKiller = usePainKiller();
  const baiClient = useSuspendedBackendaiClient();
  const domainName: string = baiClient._config.domainName;

  const [text, setText] = useState('');
  // An empty field is only an error once the reader has tried to import.
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [architecture, setArchitecture] = useState<string>(ARCHITECTURES[0]);
  const [outcomes, setOutcomes] = useState<Record<string, LineOutcome>>({});
  /** Every canonical the manager accepted, across the first run and retries. */
  const [addedCanonicals, setAddedCanonicals] = useState<Array<string>>([]);
  const [prefilledRegistry, setPrefilledRegistry] = useState<{
    registry_name: string;
    project?: string;
    url: string;
    type?: string;
  } | null>(null);

  const [registryFetchKey, updateRegistryFetchKey] = useFetchKey();
  const [, startRegistryTransition] = useTransition();
  const deferredRegistryFetchKey = useDeferredValue(registryFetchKey);

  const relayEnvironment = useRelayEnvironment();
  // The fetch key is part of the cache key, so a refresh is a new entry
  // rather than react-query staleness; nothing else may re-run the page loop.
  const { data: registryData } = useSuspenseTanQuery({
    queryKey: [
      'ImportImageModalRegistries',
      openedAt,
      deferredRegistryFetchKey,
    ],
    queryFn: () => fetchAllRegistries(relayEnvironment, domainName),
    staleTime: Infinity,
  });

  const registryNodes = filterOutNullAndUndefined(
    _.map(registryData.nodes, (edge) => edge?.node),
  ).filter((node) => !!node.registry_name);
  const { allowedRegistries } = registryData;
  // Images of a registry the domain does not allow register fine but stay out
  // of the domain's image list (manager `ImageAccessCriteria`).
  const isEnabledInDomain = (registryName: string) =>
    allowedRegistries === null || allowedRegistries.includes(registryName);

  const [commitEnableRegistry, isInFlightEnableRegistry] =
    useMutation<ImportImageModalEnableRegistryMutation>(enableRegistryMutation);
  const refreshRegistries = () =>
    startRegistryTransition(() => updateRegistryFetchKey());
  // Same write as the Enabled switch on the Registries tab.
  const enableInDomain = (registryName: string) => {
    if (isEnabledInDomain(registryName)) {
      refreshRegistries();
      return;
    }
    commitEnableRegistry({
      variables: {
        domain: domainName,
        allowed_docker_registries: _.uniq([
          ...(allowedRegistries ?? []),
          registryName,
        ]),
      },
      onCompleted: (res, errors) => {
        if (!res?.modify_domain?.ok || (errors && errors.length > 0)) {
          message.error(
            res?.modify_domain?.msg ||
              errors?.[0]?.message ||
              t('dialog.ErrorOccurred'),
          );
        } else {
          message.success({
            key: 'registry-enabled',
            content: t('registry.RegistryTurnedOn'),
          });
        }
        refreshRegistries();
      },
      onError: (error) => {
        message.error(describeError(error));
        refreshRegistries();
      },
    });
  };
  const registries: Array<RegistryRow> = registryNodes.map((node) => ({
    registry_name: node.registry_name as string,
    project: node.project ?? null,
  }));

  // A host already registered under a different project fixes the URL and the
  // type of the row we are about to create; only the project differs.
  const prefillForHost = (host: string, project?: string) => {
    const sibling = registryNodes.find((node) => node.registry_name === host);
    return {
      registry_name: host,
      project,
      url: sibling?.url ?? `https://${host}`,
      type: sibling?.type ?? undefined,
    };
  };

  // Position *and* text: the canonical alone collides when the same reference
  // is pasted twice, so two rows would share one outcome; the position alone
  // would hand a stale outcome to whatever line slides into that index.
  const lines = text.split('\n').map((raw, index) => ({
    key: `${index}:${raw}`,
    raw,
    resolved: resolveImageReference(
      parseImageReferenceLine(
        raw,
        registries.map((row) => row.registry_name),
      ),
      registries,
    ),
  }));
  const previewLines = lines.filter(
    ({ resolved }) => resolved.kind !== 'blank',
  );
  // Succeeded lines leave the text area for the locked list below, so whatever
  // is still in `previewLines` is by definition unsubmitted or failed.
  const pendingLines = previewLines.filter(
    ({ resolved }) => resolved.submittable,
  );
  const hasBlockedLine = previewLines.some(
    ({ resolved }) => !resolved.submittable,
  );
  const hasFailure = _.some(outcomes, (outcome) => outcome.status === 'error');
  const canSubmit = pendingLines.length > 0 && !hasBlockedLine;

  const [commitScanImage] =
    useMutation<ImportImageModalScanImageMutation>(scanImageMutation);

  // Resolves to `null` on success, or to the line's failure message. A
  // transport failure (timeout, 5xx) rejects and goes through `describeError`.
  const scanImage = (canonical: string) =>
    new Promise<string | null>((resolve, reject) => {
      commitScanImage({
        variables: { input: { canonical, architecture } },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            resolve(describeScanError(errors[0] as ManagerPayloadError));
          } else if (!response.adminScanImage?.item) {
            resolve(t('error.UnexpectedError'));
          } else {
            resolve(null);
          }
        },
        onError: reject,
      });
    });

  const describeReason = (resolved: ResolvedReference) => {
    const reasons: Record<ImageReferenceReason, string> = {
      tag_required: t('environment.ImportImageTagRequired'),
      digest_unsupported: t('environment.ImportImageDigestUnsupported'),
      scheme_in_canonical: t('environment.ImportImageSchemeNotAllowed'),
      host_required: t('environment.ImportImageHostRequired'),
      registry_not_registered: t(
        'environment.ImportImageRegistryNotRegistered',
        {
          registry: resolved.registryHost ?? '',
        },
      ),
      registry_ambiguous: t('environment.ImportImageRegistryAmbiguous', {
        registries: resolved.matchedRegistries
          .map((row) =>
            [row.registry_name, row.project].filter(Boolean).join('/'),
          )
          .join(', '),
      }),
      invalid_tag: t('environment.ImportImageInvalidTag'),
      invalid_reference: t('environment.ImportImageInvalidReference'),
      empty_image_name: t('environment.ImportImageEmptyImageName'),
      ngc_not_a_container: t('environment.ImportImageNotAContainer'),
      ngc_url_unparseable: t('environment.ImportImageUnreadableCatalogUrl'),
    };
    return resolved.reason ? reasons[resolved.reason] : null;
  };

  // `adminScanImage` answers a tag, repository or architecture the registry
  // does not have with `image_read_not-found` (lablup/backend.ai#14648).
  const describeScanError = (error: ManagerPayloadError) => {
    switch (error.extensions?.code) {
      case 'image_read_not-found':
        return t('environment.ImportImageNotFoundInRegistry', {
          architecture,
        });
      default:
        return describeError({ title: error.message });
    }
  };

  // Called from a `catch`, so it must never throw and must always return
  // something the reader can act on.
  const describeError = (error: any) => {
    const statusCode = error?.statusCode;
    if (statusCode === 403) {
      return t('environment.ImportImageRequiresSuperadmin');
    }
    // `client.ts` stamps 408 on both its own 30s deadline and a user abort;
    // the manager keeps scanning either way, so a retry is safe.
    if (statusCode === 408) {
      return t('environment.ImportImageScanTimedOut');
    }
    if (_.isNumber(statusCode) && statusCode >= 500 && statusCode <= 599) {
      return t('environment.ImportImageScanFailedOnServer');
    }
    const title = _.isString(error?.title) ? error.title : undefined;
    let relieved: string | undefined;
    try {
      // `usePainKiller().relieve` reads `globalThis.backendaiwebui.debug`
      // unguarded and throws when config.toml never loaded; guarded here
      // rather than in the hook, which every error path shares (FR-3953).
      relieved = title ? painKiller.relieve(title) : undefined;
    } catch {
      relieved = undefined;
    }
    return (
      relieved ||
      title ||
      (error?.isError ? error?.message : undefined) ||
      t('error.UnexpectedError')
    );
  };

  // The `finally` is the whole point: anything that throws past the per-line
  // `catch` — `describeError`, `onAdded`, a toast — would otherwise leave the
  // button loading and the modal undismissable forever (FR-3940).
  const handleAdd = async () => {
    onSubmittingChange(true);
    try {
      const runOutcomes: Record<string, LineOutcome> = {};
      const addedInThisRun: Array<string> = [];
      const remainingRawLines: Array<string> = [];
      // Failures re-keyed to the keys the rebuilt text area will produce:
      // dropping the succeeded lines renumbers everything below them.
      const nextOutcomes: Record<string, LineOutcome> = {};

      // The whole batch is marked before the first request, so a reader can
      // see what is still coming during a scan that takes tens of seconds.
      for (const { key, resolved } of lines) {
        if (resolved.submittable && resolved.canonical) {
          runOutcomes[key] = { status: 'queued' };
        }
      }
      setOutcomes({ ...runOutcomes });

      for (const { key, raw, resolved } of lines) {
        const canonical = resolved.canonical;
        if (!resolved.submittable || !canonical) {
          remainingRawLines.push(raw);
          continue;
        }
        runOutcomes[key] = { status: 'pending' };
        setOutcomes({ ...runOutcomes });
        let failure: string | null;
        try {
          failure = await scanImage(canonical);
        } catch (error) {
          failure = describeError(error);
        }
        if (failure === null) {
          runOutcomes[key] = { status: 'success' };
          addedInThisRun.push(canonical);
        } else {
          runOutcomes[key] = { status: 'error', message: failure };
          nextOutcomes[`${remainingRawLines.length}:${raw}`] = {
            status: 'error',
            message: failure,
          };
          remainingRawLines.push(raw);
        }
        setOutcomes({ ...runOutcomes });
      }

      // Succeeded lines are locked: out of the editable text and into the list
      // below, with the architecture frozen because it applies to the whole
      // batch. A retry therefore submits only what is left. The locked list is
      // a set of images, so a reference pasted twice locks once.
      const cumulative = _.union(addedCanonicals, addedInThisRun);
      setAddedCanonicals(cumulative);
      setText(remainingRawLines.join('\n'));
      setOutcomes(nextOutcomes);

      if (addedInThisRun.length > 0) {
        onAdded?.(_.uniq(addedInThisRun));
      }
      if (!_.some(remainingRawLines, (raw) => raw.trim().length > 0)) {
        message.success({
          key: 'images-added',
          content: t('environment.ImagesSuccessfullyAdded', {
            count: cumulative.length,
          }),
        });
        onRequestClose();
      }
    } finally {
      onSubmittingChange(false);
    }
  };

  // `handleAdd` describes every per-line failure itself, so a rejection here is
  // the loop breaking; a bare `void` would leave the user with no word at all.
  const submit = () => {
    setHasTriedSubmit(true);
    if (!canSubmit) {
      // The errored items render on this state change, so look one frame later.
      // A long preview keeps its blocked lines far below the item's label, so
      // the first blocked line is the target when there is one.
      requestAnimationFrame(() => {
        (
          queryWithinOpenModal('[data-import-blocked="true"]') ??
          queryWithinOpenModal('.uic-form-item[data-status="error"]')
        )?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      });
      return;
    }
    handleAdd().catch((error) => {
      message.error({
        key: 'import-image-failed',
        content: describeError(error),
      });
    });
  };
  useEffect(() => {
    submitRef.current = submit;
  });
  const reportFooterState = useEffectEvent(() =>
    onFooterStateChange({ hasFailure }),
  );
  useEffect(() => {
    reportFooterState();
  }, [hasFailure]);

  const describeStatus = (
    outcome: LineOutcome | undefined,
    submittable: boolean,
  ): LineStatus => {
    if (outcome?.status === 'success') {
      return {
        variant: 'success' as const,
        label: t('environment.ImportImageAdded'),
      };
    }
    if (outcome?.status === 'error') {
      return {
        variant: 'error' as const,
        label: t('environment.ImportImageFailed'),
      };
    }
    if (outcome?.status === 'pending') {
      return {
        variant: 'accent' as const,
        label: t('environment.ImportImageScanning'),
        isPulsing: true,
      };
    }
    if (outcome?.status === 'queued') {
      return {
        variant: 'neutral' as const,
        label: t('environment.ImportImageQueued'),
      };
    }
    return submittable
      ? { variant: 'accent' as const, label: t('environment.ImportImageReady') }
      : {
          variant: 'error' as const,
          label: t('environment.ImportImageNeedsAttention'),
        };
  };

  const isReferencesMissing =
    hasTriedSubmit && pendingLines.length === 0 && !hasBlockedLine;
  const blockedLineCount = previewLines.filter(
    ({ resolved }) => !resolved.submittable,
  ).length;

  const renderMarker = (status: LineStatus) => (
    <Center isInline xstyle={styles.marker}>
      <StatusDot
        variant={status.variant}
        label={status.label}
        isPulsing={status.isPulsing}
      />
    </Center>
  );

  const importedStatus = describeStatus({ status: 'success' }, true);

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIFormItemVisual
        label={t('environment.ImportImageReferences')}
        // An explicit `help` outranks `errors`, so it steps aside for one.
        help={
          isReferencesMissing ? undefined : t('environment.ImportImageDesc')
        }
        required
        requiredMarkType="optional"
        status={isReferencesMissing ? 'error' : ''}
        errors={
          isReferencesMissing
            ? [t('environment.ImportImageReferencesRequired')]
            : undefined
        }
        style={{ marginBottom: 0 }}
      >
        <TextArea
          label={t('environment.ImportImageReferences')}
          isLabelHidden
          placeholder={t('environment.ImportImagePlaceholder')}
          rows={5}
          value={text}
          isDisabled={isSubmitting}
          onChange={(value) => setText(value)}
        />
      </BAIFormItemVisual>
      <BAIFormItemVisual
        label={t('environment.Architecture')}
        required
        requiredMarkType="optional"
        style={{ marginBottom: 0 }}
      >
        <BAISelect
          label={t('environment.Architecture')}
          isLabelHidden
          value={architecture}
          // One architecture is sent with every line, so it cannot change once
          // part of the batch is registered.
          disabled={isSubmitting || addedCanonicals.length > 0}
          onChange={(value) => setArchitecture(value)}
          options={ARCHITECTURES.map((value) => ({ label: value, value }))}
        />
      </BAIFormItemVisual>
      {addedCanonicals.length > 0 || previewLines.length > 0 ? (
        // Imported lines and pending ones share one list, so a line stays in
        // the single place the reader already looked.
        <BAIFormItemVisual
          label={t('environment.ImportImagePreview')}
          required
          requiredMarkType="optional"
          status={blockedLineCount > 0 ? 'error' : ''}
          errors={
            blockedLineCount > 0
              ? [
                  t('environment.ImportImageLinesBlocked', {
                    count: blockedLineCount,
                  }),
                ]
              : undefined
          }
          style={{ marginBottom: 0 }}
        >
          <List density="compact" hasDividers>
            {addedCanonicals.map((canonical) => (
              <ListItem
                key={`added-${canonical}`}
                data-testid="import-image-added-row"
                xstyle={styles.row}
                startContent={renderMarker(importedStatus)}
                label={
                  <Text type="code" hasStrikethrough xstyle={styles.canonical}>
                    {canonical}
                  </Text>
                }
                description={
                  <Text type="supporting">{importedStatus.label}</Text>
                }
              />
            ))}
            {previewLines.map(({ key, raw, resolved }) => {
              const outcome = outcomes[key];
              const disabledRegistry =
                resolved.submittable &&
                resolved.registryHost &&
                outcome?.status !== 'success' &&
                !isEnabledInDomain(resolved.registryHost)
                  ? resolved.registryHost
                  : null;
              const status: LineStatus =
                disabledRegistry && !outcome
                  ? {
                      variant: 'warning',
                      label: t('environment.ImportImageNeedsAttention'),
                    }
                  : describeStatus(outcome, resolved.submittable);
              const isBlocking =
                !resolved.submittable || outcome?.status === 'error';
              const metaText = resolved.imageName
                ? [
                    resolved.project ?? t('environment.ImportImageNoProject'),
                    resolved.imageName,
                    resolved.tag || t('environment.ImportImageNoTag'),
                  ].join(' / ')
                : null;
              // The server's word is the newer fact, so it displaces the
              // client-side reason rather than stacking under it.
              const detailText =
                outcome?.message ??
                describeReason(resolved) ??
                (disabledRegistry
                  ? t('environment.ImportImageRegistryDisabledInDomain', {
                      registry: disabledRegistry,
                    })
                  : null);
              const tagsUrl =
                resolved.reason === 'tag_required' &&
                resolved.kind === 'ngc-url'
                  ? ngcTagsUrl(resolved.remotePath)
                  : null;
              const unregisteredHost =
                resolved.reason === 'registry_not_registered'
                  ? resolved.registryHost
                  : null;
              return (
                <ListItem
                  key={key}
                  data-import-blocked={!resolved.submittable || undefined}
                  xstyle={styles.row}
                  startContent={renderMarker(status)}
                  label={
                    <Text
                      type="code"
                      hasStrikethrough={outcome?.status === 'success'}
                      xstyle={styles.canonical}
                    >
                      {resolved.canonical ?? raw.trim()}
                    </Text>
                  }
                  description={
                    // "Status: why" when there is something to say, else
                    // "Status: project / image / tag".
                    <Text type="supporting">
                      {status.label}
                      {detailText ? (
                        <>
                          {': '}
                          <Text
                            type="supporting"
                            color={isBlocking ? 'danger' : 'primary'}
                          >
                            {detailText}
                          </Text>
                        </>
                      ) : metaText ? (
                        `: ${metaText}`
                      ) : null}
                    </Text>
                  }
                  endContent={
                    tagsUrl || unregisteredHost || disabledRegistry ? (
                      <HStack gap={2} align="center">
                        {tagsUrl ? (
                          <Link
                            href={tagsUrl}
                            target="_blank"
                            rel="noreferrer"
                            size="sm"
                          >
                            {t('environment.ImportImageOpenCatalogTags')}
                          </Link>
                        ) : null}
                        {unregisteredHost ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={<PlusIcon size="1em" />}
                            label={t('registry.AddRegistry')}
                            onClick={() =>
                              setPrefilledRegistry(
                                prefillForHost(
                                  unregisteredHost,
                                  resolved.remotePath?.split('/')[0],
                                ),
                              )
                            }
                          />
                        ) : null}
                        {disabledRegistry ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            label={t('environment.ImportImageEnableRegistry')}
                            isLoading={isInFlightEnableRegistry}
                            isDisabled={isSubmitting}
                            onClick={() => enableInDomain(disabledRegistry)}
                          />
                        ) : null}
                      </HStack>
                    ) : null
                  }
                />
              );
            })}
          </List>
        </BAIFormItemVisual>
      ) : null}
      <BAIUnmountAfterClose>
        <ContainerRegistryEditorModal
          open={!!prefilledRegistry}
          initialValues={prefilledRegistry ?? undefined}
          centered={false}
          onOk={(type, registry) => {
            setPrefilledRegistry(null);
            if (type === 'create') {
              message.success({
                key: 'registry-added',
                content: t('registry.RegistrySuccessfullyAdded'),
              });
              // Enabled here too, or its images would import into a list that
              // cannot show them; the refresh re-resolves every line it names.
              if (registry?.registry_name) {
                enableInDomain(registry.registry_name);
              } else {
                refreshRegistries();
              }
            }
          }}
          onCancel={() => setPrefilledRegistry(null)}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

const ImportImageModal: React.FC<ImportImageModalProps> = ({
  onRequestClose,
  onAdded,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  // Owned here, not in the content: a dismissal mid-run unmounts the content
  // through `BAIUnmountAfterClose` while its request loop is still going.
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Held here, outside the Suspense boundary: state in the suspending content
  // is thrown away on every retry, so a nonce there would never settle.
  const [openedAt] = useState(() => Date.now());
  const submitRef = useRef<(() => void) | null>(null);
  const [footerState, setFooterState] = useState<ImportFooterState>({
    hasFailure: false,
  });

  return (
    <BAIModal
      {...baiModalProps}
      title={t('environment.ImportImageFromRegistry')}
      width={720}
      // Astryx caps a standard dialog at 75dvh; let it grow to the viewport
      // less an inset so long batches scroll in the body, not the page.
      maxHeight={MODAL_MAX_HEIGHT}
      okText={
        footerState.hasFailure
          ? t('environment.ImportImageRetryFailed')
          : t('environment.ImportImage')
      }
      okButtonProps={{ disabled: isSubmitting }}
      confirmLoading={isSubmitting}
      onOk={() => submitRef.current?.()}
      cancelText={t('button.Cancel')}
      cancelButtonProps={{ disabled: isSubmitting }}
      maskClosable={false}
      // While the scan loop runs, drop every dismissal affordance: no close
      // icon, and `onCancel` short-circuits so Escape cannot sneak one past.
      closable={!isSubmitting}
      onCancel={() => {
        if (isSubmitting) return;
        onRequestClose();
      }}
    >
      {/* The registry query lives in the content so the header stays on
          screen while it loads. */}
      <Suspense fallback={<BAISkeleton rows={5} />}>
        <ImportImageModalContent
          onRequestClose={onRequestClose}
          onAdded={onAdded}
          isSubmitting={isSubmitting}
          onSubmittingChange={setIsSubmitting}
          openedAt={openedAt}
          submitRef={submitRef}
          onFooterStateChange={setFooterState}
        />
      </Suspense>
    </BAIModal>
  );
};

export default ImportImageModal;
