/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  parseModelDefinitionYaml,
  type ParsedModelDefinition,
} from '../helper/parseModelDefinitionYaml';
import { useSuspendedBackendaiClient } from './index';
import { useTanQuery } from './reactQueryAlias';
import { safeDecodeUuid } from 'backend.ai-ui';

// The model definition file lives at the model vfolder root by convention.
const MODEL_DEFINITION_FILENAME = 'model-definition.yaml';

/**
 * Reads and parses the selected model folder's `model-definition.yaml` so its
 * values can be used as placeholders (display-only hints) in the custom
 * runtime-variant add-revision form (FR-3205).
 *
 * The read is best-effort: any transport, HTTP, or parse failure resolves to
 * `null` so callers silently fall back to their static placeholders — the user
 * never sees an error for a missing/invalid definition file.
 *
 * @param modelFolderId  `VirtualFolderNode` global id from `BAIVFolderSelect`.
 * @param enabled        Gate the read (custom variant + a folder selected).
 */
export const useModelDefinitionPlaceholders = (
  modelFolderId: string | undefined,
  enabled: boolean,
): { defaults: ParsedModelDefinition | null; isLoading: boolean } => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();

  // `modelFolderId` is a global id; the download API is keyed by the raw
  // vfolder UUID. Decode once and key the query cache by it so switching
  // folders refetches while re-renders reuse the cached parse.
  const vfolderId = modelFolderId ? safeDecodeUuid(modelFolderId) : undefined;

  const { data, isFetching } = useTanQuery({
    queryKey: ['modelDefinitionDefaults', vfolderId],
    queryFn: async (): Promise<ParsedModelDefinition | null> => {
      if (!vfolderId) return null;
      try {
        const tokenResponse = await baiClient.vfolder.request_download_token(
          MODEL_DEFINITION_FILENAME,
          vfolderId,
          false,
        );
        const downloadUrl = `${tokenResponse.url}?token=${tokenResponse.token}&archive=false`;
        const response = await fetch(downloadUrl);
        if (!response.ok) return null;
        const content = await (await response.blob()).text();
        return parseModelDefinitionYaml(content);
      } catch {
        return null;
      }
    },
    enabled: enabled && !!vfolderId,
    // Revalidate once per modal open so an edited definition file is picked
    // up on reopen. `staleTime: 0` only refetches on mount / vfolder change —
    // re-renders and mode toggles reuse the cached parse, so this stays a
    // single lightweight read per open, not a per-render download.
    staleTime: 0,
  });

  return { defaults: data ?? null, isLoading: isFetching };
};
