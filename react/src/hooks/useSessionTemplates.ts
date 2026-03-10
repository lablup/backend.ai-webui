/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { baiSignedRequestWithPromise } from '../helper';
import { useTanMutation, useTanQuery } from './reactQueryAlias';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdatableState } from 'backend.ai-ui';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export interface SessionTemplateMetadata {
  name: string;
  tag: string | null;
}

export interface SessionTemplateKernelSpec {
  image: string;
  architecture?: string;
  environ?: Record<string, string>;
  run?: {
    bootstrap?: string;
    startup_command?: string;
  };
}

export interface SessionTemplateResourceSpec {
  cpu?: string;
  /** Memory in bytes */
  mem?: string;
  'cuda.device'?: string;
  'cuda.shares'?: string;
  [key: string]: string | undefined;
}

export interface SessionTemplateSpec {
  session_type: 'interactive' | 'batch' | 'inference';
  kernel: SessionTemplateKernelSpec;
  scaling_group?: string;
  mounts?: Record<string, any>;
  resources?: SessionTemplateResourceSpec;
  agent_list?: string[] | null;
}

export interface SessionTemplateBody {
  api_version: string;
  kind: string;
  metadata: SessionTemplateMetadata;
  spec: SessionTemplateSpec;
}

export interface SessionTemplate {
  id: string;
  name: string | null;
  type: 'task' | 'cluster';
  is_active: boolean;
  domain_name: string;
  user: string;
  user_email: string | null;
  group: string | null;
  group_name: string | null;
  is_owner: boolean;
  created_at: string;
  template: SessionTemplateBody;
}

// ---------------------------------------------------------------------------
// Payload shapes for create / update
// ---------------------------------------------------------------------------

export interface CreateSessionTemplatePayload {
  template: SessionTemplateBody;
  domain_name?: string;
  group_name?: string;
}

export interface UpdateSessionTemplatePayload {
  template: SessionTemplateBody;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

const SESSION_TEMPLATE_QUERY_KEY = 'useSessionTemplates';

/**
 * Hook that provides CRUD operations for Backend.AI session templates.
 *
 * @param listAll - When true, fetches all templates regardless of ownership.
 * @param groupId - Optional group UUID to filter templates by group.
 */
export const useSessionTemplates = (
  listAll = false,
  groupId?: string | null,
) => {
  'use memo';

  const baiClient = useSuspendedBackendaiClient();
  const queryClient = useQueryClient();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');

  // -------------------------------------------------------------------------
  // List query
  // -------------------------------------------------------------------------
  const {
    data: sessionTemplatesData,
    isLoading,
    error,
  } = useTanQuery<{ items: SessionTemplate[] }>({
    queryKey: [SESSION_TEMPLATE_QUERY_KEY, fetchKey, listAll, groupId ?? null],
    queryFn: async () => {
      const result = await baiClient.sessionTemplate.list(
        listAll,
        groupId ?? null,
      );
      // The REST API returns { items: [...] } or an array directly depending
      // on manager version; normalise to always expose an `items` array.
      if (Array.isArray(result)) {
        return { items: result as SessionTemplate[] };
      }
      return {
        items: (result?.items ?? result?.templates ?? []) as SessionTemplate[],
      };
    },
    staleTime: 0,
  });

  const sessionTemplates = sessionTemplatesData?.items ?? [];

  // -------------------------------------------------------------------------
  // Refresh helper
  // -------------------------------------------------------------------------
  const refresh = () => {
    updateFetchKey();
    queryClient.invalidateQueries({
      queryKey: [SESSION_TEMPLATE_QUERY_KEY],
    });
  };

  // -------------------------------------------------------------------------
  // Create mutation
  // -------------------------------------------------------------------------
  const mutationToCreate = useTanMutation<
    SessionTemplate,
    Error,
    CreateSessionTemplatePayload
  >({
    mutationFn: (payload: CreateSessionTemplatePayload) => {
      // Backend.AI manager API expects `payload` (not `template`) as the key.
      // Each item in the array must wrap the template body inside a `template` field
      // with optional `name`, `group_id`, `user_uuid` at the same level.
      const payloadItem = {
        name: payload.template.metadata?.name ?? '',
        template: payload.template,
      };
      const body = {
        payload: JSON.stringify([payloadItem]),
        ...(payload.domain_name ? { domain_name: payload.domain_name } : {}),
        ...(payload.group_name ? { group_name: payload.group_name } : {}),
      };
      return baiSignedRequestWithPromise({
        method: 'POST',
        url: '/template/session',
        body,
        client: baiClient,
      });
    },
    onSuccess: () => {
      refresh();
    },
  });

  // -------------------------------------------------------------------------
  // Update mutation
  // -------------------------------------------------------------------------
  const mutationToUpdate = useTanMutation<
    SessionTemplate,
    Error,
    { id: string } & UpdateSessionTemplatePayload
  >({
    mutationFn: ({ id, template }) => {
      const payloadItem = {
        name: template.metadata?.name ?? '',
        template: template,
      };
      const body = {
        payload: JSON.stringify([payloadItem]),
      };
      return baiSignedRequestWithPromise({
        method: 'PUT',
        url: `/template/session/${id}`,
        body,
        client: baiClient,
      });
    },
    onSuccess: () => {
      refresh();
    },
  });

  // -------------------------------------------------------------------------
  // Delete mutation
  // -------------------------------------------------------------------------
  const mutationToDelete = useTanMutation<void, Error, string>({
    mutationFn: (id: string) => {
      return baiSignedRequestWithPromise({
        method: 'DELETE',
        url: `/template/session/${id}`,
        client: baiClient,
      });
    },
    onSuccess: () => {
      refresh();
    },
  });

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  return {
    sessionTemplates,
    isLoading,
    error,
    refresh,

    createTemplate: (
      payload: CreateSessionTemplatePayload,
    ): Promise<SessionTemplate> => mutationToCreate.mutateAsync(payload),
    isCreating: mutationToCreate.isPending,

    updateTemplate: (
      id: string,
      payload: UpdateSessionTemplatePayload,
    ): Promise<SessionTemplate> =>
      mutationToUpdate.mutateAsync({ id, ...payload }),
    isUpdating: mutationToUpdate.isPending,

    deleteTemplate: (id: string): Promise<void> =>
      mutationToDelete.mutateAsync(id),
    isDeleting: mutationToDelete.isPending,
  };
};
