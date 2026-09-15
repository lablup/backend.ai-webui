/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ImportImageModalRegistriesQuery } from '../__generated__/ImportImageModalRegistriesQuery.graphql';
import { App } from '../app-shim';
import { baiSignedRequestWithPromise } from '../helper';
import {
  parseImageReferenceLine,
  resolveImageReference,
  type ImageReferenceReason,
  type RegistryRow,
  type ResolvedReference,
} from '../helper/imageReferenceParser';
import { useSuspendedBackendaiClient } from '../hooks';
import { useSuspenseTanQuery, useTanMutation } from '../hooks/reactQueryAlias';
import { usePainKiller } from '../hooks/usePainKiller';
import ContainerRegistryEditorModal from './ContainerRegistryEditorModal';
import './ImportImageModal.css';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
import { TextArea } from '@astryxdesign/core/TextArea';
import {
  BAIFlex,
  BAILink,
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

/**
 * `RescanImagesResponse` / `ImageDTO` from
 * `ai.backend.common.dto.manager.image.response`. Only the fields this modal
 * reads are declared; the client package cannot host it while `@ts-nocheck`
 * stands on its resource files.
 */
interface ScanImageResponse {
  item: {
    id: string;
    name: string;
    registry: string;
    project: string | null;
    tag: string | null;
    architecture: string;
  };
  errors: Array<string>;
}

type LineOutcome = { status: 'success' | 'error'; message?: string };

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

/**
 * `client.ts` stores an empty `Blob` in `response` when the manager answers
 * without a body, so `!error.response` is never true for a bodiless failure.
 */
export const isEmptyResponse = (error: any) => {
  const response = error?.response;
  if (response === null || response === undefined) return true;
  if (typeof response === 'string') return response.length === 0;
  if (typeof Blob !== 'undefined' && response instanceof Blob) {
    return response.size === 0;
  }
  return false;
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

const ImportImageModalContent: React.FC<{
  onRequestClose: () => void;
  onAdded?: (added: Array<string>) => void;
  isSubmitting: boolean;
  onSubmittingChange: (isSubmitting: boolean) => void;
}> = ({ onRequestClose, onAdded, isSubmitting, onSubmittingChange }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const baiClient = useSuspendedBackendaiClient();
  const painKiller = usePainKiller();

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

  const lines = text.split('\n').map((raw, index) => ({
    key: `${index}`,
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

  const scanImage = useTanMutation<
    ScanImageResponse,
    unknown,
    { canonical: string; architecture: string }
  >({
    mutationFn: (values) =>
      baiSignedRequestWithPromise<ScanImageResponse>({
        method: 'POST',
        url: '/admin/images/rescan',
        body: values,
        client: baiClient,
      }),
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
      unsupported_command: t('environment.ImportImageUnsupportedCommand'),
    };
    return resolved.reason ? reasons[resolved.reason] : null;
  };

  // A 404 `image_read_not-found` is today's behaviour for a canonical the
  // manager's DB does not already carry (lablup/backend.ai#14612), and a bodiless
  // 500 is how a missing manifest surfaces until the same ticket lands.
  const describeError = (error: any) => {
    if (
      error?.statusCode === 404 &&
      error?.error_code === 'image_read_not-found'
    ) {
      return t('environment.ImportImageManagerCannotRegisterNewImages');
    }
    if (error?.statusCode === 500 && isEmptyResponse(error)) {
      return t('environment.ImportImageTagNotFoundInRegistry');
    }
    if (error?.statusCode === 403) {
      return t('environment.ImportImageRequiresSuperadmin');
    }
    return painKiller.relieve(error?.title) || error?.message || String(error);
  };

  const handleAdd = async () => {
    onSubmittingChange(true);
    setOutcomes({});
    const runOutcomes: Record<string, LineOutcome> = {};
    const addedInThisRun: Array<string> = [];
    const remainingRawLines: Array<string> = [];

    for (const { raw, resolved } of lines) {
      const canonical = resolved.canonical;
      if (!resolved.submittable || !canonical) {
        remainingRawLines.push(raw);
        continue;
      }
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
        failure = describeError(error);
      }
      if (failure === null) {
        runOutcomes[canonical] = { status: 'success' };
        addedInThisRun.push(canonical);
      } else {
        runOutcomes[canonical] = { status: 'error', message: failure };
        remainingRawLines.push(raw);
      }
      setOutcomes({ ...runOutcomes });
    }
    onSubmittingChange(false);

    // Succeeded lines are locked: out of the editable text and into the list
    // below, with the architecture frozen because it applies to the whole
    // batch. A retry therefore submits only what is left.
    const cumulative = [...addedCanonicals, ...addedInThisRun];
    setAddedCanonicals(cumulative);
    setText(remainingRawLines.join('\n'));
    setOutcomes(_.pickBy(runOutcomes, (outcome) => outcome.status === 'error'));

    if (addedInThisRun.length > 0) {
      onAdded?.(addedInThisRun);
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
  };

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
      {addedCanonicals.length > 0 ? (
        <BAIFlex
          data-testid="import-image-added-list"
          direction="column"
          align="stretch"
          gap="xxs"
        >
          <Text type="supporting">{t('environment.ImportImageAdded')}</Text>
          {addedCanonicals.map((canonical) => (
            <BAIFlex key={canonical} gap="xs" align="center" wrap="wrap">
              <Badge
                variant="success"
                label={t('environment.ImportImageAdded')}
              />
              <Text type="code">{canonical}</Text>
            </BAIFlex>
          ))}
        </BAIFlex>
      ) : null}
      {previewLines.length > 0 ? (
        <BAIFlex
          className="import-image-preview"
          direction="column"
          align="stretch"
          gap="sm"
        >
          {previewLines.map(({ key, raw, resolved }) => {
            const outcome = resolved.canonical
              ? outcomes[resolved.canonical]
              : undefined;
            const reasonText = describeReason(resolved);
            const tagsUrl =
              resolved.reason === 'tag_required' && resolved.kind === 'ngc-url'
                ? ngcTagsUrl(resolved.remotePath)
                : null;
            return (
              <BAIFlex key={key} direction="column" align="start" gap="xxs">
                <BAIFlex gap="xs" align="center" wrap="wrap">
                  <Badge
                    variant={
                      outcome?.status === 'success'
                        ? 'success'
                        : outcome?.status === 'error'
                          ? 'error'
                          : resolved.submittable
                            ? 'info'
                            : 'warning'
                    }
                    label={
                      outcome?.status === 'success'
                        ? t('environment.ImportImageAdded')
                        : outcome?.status === 'error'
                          ? t('environment.ImportImageFailed')
                          : resolved.submittable
                            ? t('environment.ImportImageReady')
                            : t('environment.ImportImageNeedsAttention')
                    }
                  />
                  <Text
                    type="code"
                    hasStrikethrough={outcome?.status === 'success'}
                  >
                    {resolved.canonical ?? raw.trim()}
                  </Text>
                </BAIFlex>
                {resolved.imageName ? (
                  <Text type="supporting">
                    {[
                      resolved.project ?? t('environment.ImportImageNoProject'),
                      resolved.imageName,
                      resolved.tag || t('environment.ImportImageNoTag'),
                    ].join(' · ')}
                  </Text>
                ) : null}
                {reasonText ? (
                  <Text type="supporting" color="primary">
                    {reasonText}
                  </Text>
                ) : null}
                {outcome?.message ? (
                  <Text type="supporting" color="primary">
                    {outcome.message}
                  </Text>
                ) : null}
                {tagsUrl ? (
                  <BAILink to={tagsUrl} target="_blank">
                    {t('environment.ImportImageOpenCatalogTags')}
                  </BAILink>
                ) : null}
                {resolved.reason === 'registry_not_registered' &&
                resolved.registryHost ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<PlusIcon size="1em" />}
                    label={t('registry.AddRegistry')}
                    onClick={() =>
                      setPrefilledRegistry(
                        prefillForHost(
                          resolved.registryHost as string,
                          resolved.remotePath?.split('/')[0],
                        ),
                      )
                    }
                  />
                ) : null}
              </BAIFlex>
            );
          })}
        </BAIFlex>
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
            void handleAdd();
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
