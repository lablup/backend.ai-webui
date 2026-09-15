/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ImportImageModalRegistriesQuery } from '../__generated__/ImportImageModalRegistriesQuery.graphql';
import { App } from '../app-shim';
import {
  parseImageReferenceLine,
  resolveImageReference,
  type ImageReferenceReason,
  type RegistryRow,
  type ResolvedReference,
} from '../helper/imageReferenceParser';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import { useDescribeScanImageError, useScanImage } from '../hooks/useScanImage';
import ContainerRegistryEditorModal from './ContainerRegistryEditorModal';
import './ImportImageModal.css';
import { Button } from '@astryxdesign/core/Button';
import { Center } from '@astryxdesign/core/Center';
import { Link } from '@astryxdesign/core/Link';
import { List, ListItem } from '@astryxdesign/core/List';
import { HStack } from '@astryxdesign/core/Stack';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Text } from '@astryxdesign/core/Text';
import { TextArea } from '@astryxdesign/core/TextArea';
import {
  borderVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
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
import { Suspense, useDeferredValue, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';
import type { IEnvironment } from 'relay-runtime';

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
  query ImportImageModalRegistriesQuery($first: Int, $after: String) {
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
): Promise<Array<RegistryNode>> => {
  const nodes: Array<RegistryNode> = [];
  let after: string | null = null;
  for (let page = 0; page < REGISTRY_PAGE_LIMIT; page++) {
    // Annotated: `after` is written from this very result, so an inferred
    // type would be circular (TS7022).
    const data: ImportImageModalRegistriesQuery['response'] | undefined =
      await fetchQuery<ImportImageModalRegistriesQuery>(
        environment,
        registriesQuery,
        { first: REGISTRY_PAGE_SIZE, after },
        { fetchPolicy: 'network-only' },
      ).toPromise();
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
  return nodes;
};

export interface ImportImageModalProps extends Omit<BAIModalProps, 'onOk'> {
  onRequestClose: () => void;
  /** Canonicals the manager accepted, in submission order. */
  onAdded?: (added: Array<string>) => void;
}

const ARCHITECTURES = ['x86_64', 'aarch64'] as const;

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
}> = ({ onRequestClose, onAdded, isSubmitting, onSubmittingChange }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();

  const [text, setText] = useState('');
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
  const { data: registryEdges } = useSuspenseTanQuery({
    queryKey: ['ImportImageModalRegistries', deferredRegistryFetchKey],
    queryFn: () => fetchAllRegistries(relayEnvironment),
    staleTime: Infinity,
  });

  const registryNodes = filterOutNullAndUndefined(
    _.map(registryEdges, (edge) => edge?.node),
  ).filter((node) => !!node.registry_name);
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
    resolved: resolveImageReference(parseImageReferenceLine(raw), registries),
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

  const scanImage = useScanImage();
  const describeScanError = useDescribeScanImageError();

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

  // The `finally` is the whole point: anything that throws past the per-line
  // `catch` — `describeScanError`, `onAdded`, a toast — would otherwise leave
  // the button loading and the modal undismissable forever (FR-3940).
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
        let failure: string | null = null;
        try {
          const response = await scanImage.mutateAsync({
            canonical,
            architecture,
          });
          // A 200 only says the rescan ran; a per-image failure comes back in
          // `errors`, and such an image was not registered.
          const errors = _.compact(response?.errors);
          if (errors.length > 0) {
            failure = errors.join('\n');
          }
        } catch (error) {
          failure = describeScanError(error, {
            notFound: t(
              'environment.ImportImageManagerCannotRegisterNewImages',
            ),
            forbidden: t('environment.ImportImageRequiresSuperadmin'),
          });
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
          variant: 'warning' as const,
          label: t('environment.ImportImageNeedsAttention'),
        };
  };

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
      <TextArea
        label={t('environment.ImportImageReferences')}
        description={t('environment.ImportImageDesc')}
        placeholder={t('environment.ImportImagePlaceholder')}
        rows={5}
        value={text}
        isDisabled={isSubmitting}
        onChange={(value) => setText(value)}
      />
      <BAISelect
        label={t('environment.Architecture')}
        value={architecture}
        // One architecture is sent with every line, so it cannot change once
        // part of the batch is registered.
        disabled={isSubmitting || addedCanonicals.length > 0}
        onChange={(value) => setArchitecture(value)}
        options={ARCHITECTURES.map((value) => ({ label: value, value }))}
      />
      {addedCanonicals.length > 0 || previewLines.length > 0 ? (
        // Imported lines and pending ones share one row idiom and one scroll
        // box, so a line stays in the single place the reader already looked.
        <List className="import-image-preview" density="compact" hasDividers>
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
            const status = describeStatus(outcome, resolved.submittable);
            const metaText = resolved.imageName
              ? [
                  resolved.project ?? t('environment.ImportImageNoProject'),
                  resolved.imageName,
                  resolved.tag || t('environment.ImportImageNoTag'),
                ].join(' · ')
              : null;
            // The server's word is the newer fact, so it displaces the
            // client-side reason rather than stacking under it.
            const detailText = outcome?.message ?? describeReason(resolved);
            const tagsUrl =
              resolved.reason === 'tag_required' && resolved.kind === 'ngc-url'
                ? ngcTagsUrl(resolved.remotePath)
                : null;
            const unregisteredHost =
              resolved.reason === 'registry_not_registered'
                ? resolved.registryHost
                : null;
            return (
              <ListItem
                key={key}
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
                  <Text type="supporting">
                    {status.label}
                    {metaText ? ` · ${metaText}` : null}
                    {detailText ? (
                      <>
                        {' · '}
                        <Text type="supporting" color="primary">
                          {detailText}
                        </Text>
                      </>
                    ) : null}
                  </Text>
                }
                endContent={
                  tagsUrl || unregisteredHost ? (
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
                    </HStack>
                  ) : null
                }
              />
            );
          })}
        </List>
      ) : null}
      <BAIFlex justify="end" gap="xs">
        <Button
          variant="secondary"
          label={t('button.Cancel')}
          isDisabled={isSubmitting}
          onClick={onRequestClose}
        />
        {/* `onClick`, not `clickAction`: the latter runs the handler inside a
            `startTransition`, which holds every state update it makes — the
            submitting flag included — until the whole loop settles. */}
        <Button
          variant="primary"
          isDisabled={!canSubmit || isSubmitting}
          isLoading={isSubmitting}
          label={
            hasFailure
              ? t('environment.ImportImageRetryFailed')
              : t('environment.ImportImage')
          }
          onClick={() => {
            // `handleAdd` describes every per-line failure itself, so a
            // rejection here is the loop breaking; a bare `void` would swallow
            // it and the user would be left with no word at all.
            handleAdd().catch((error) => {
              message.error({
                key: 'import-image-failed',
                content: describeScanError(error, {
                  notFound: t(
                    'environment.ImportImageManagerCannotRegisterNewImages',
                  ),
                  forbidden: t('environment.ImportImageRequiresSuperadmin'),
                }),
              });
            });
          }}
        />
      </BAIFlex>
      <BAIUnmountAfterClose>
        <ContainerRegistryEditorModal
          open={!!prefilledRegistry}
          initialValues={prefilledRegistry ?? undefined}
          centered={false}
          onOk={(type) => {
            setPrefilledRegistry(null);
            if (type === 'create') {
              message.success({
                key: 'registry-added',
                content: t('registry.RegistrySuccessfullyAdded'),
              });
              // The new row re-resolves every line that named this registry.
              startRegistryTransition(() => updateRegistryFetchKey());
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

  return (
    <BAIModal
      {...baiModalProps}
      title={t('environment.ImportImageFromRegistry')}
      width={720}
      footer={null}
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
        />
      </Suspense>
    </BAIModal>
  );
};

export default ImportImageModal;
