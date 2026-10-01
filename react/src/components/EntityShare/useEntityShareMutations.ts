/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { useEntityShareMutationsAcceptMutation } from '../../__generated__/useEntityShareMutationsAcceptMutation.graphql';
import type { useEntityShareMutationsCancelMutation } from '../../__generated__/useEntityShareMutationsCancelMutation.graphql';
import type { useEntityShareMutationsLeaveMutation } from '../../__generated__/useEntityShareMutationsLeaveMutation.graphql';
import type { useEntityShareMutationsRejectMutation } from '../../__generated__/useEntityShareMutationsRejectMutation.graphql';
import type { useEntityShareMutationsRevokeMutation } from '../../__generated__/useEntityShareMutationsRevokeMutation.graphql';
import { App } from '../../app-shim';
import {
  useBAILogger,
  useErrorMessageResolver,
  useMutationWithPromise,
} from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';
import { graphql } from 'react-relay';

/**
 * The five answers a share takes. Each returns the share's new `status`, so
 * Relay patches the row in place; callers refetch only when a status filter
 * makes the row leave the list.
 */
const useEntityShareMutations = () => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const { getErrorMessage } = useErrorMessageResolver();

  const acceptMutation =
    useMutationWithPromise<useEntityShareMutationsAcceptMutation>(graphql`
      mutation useEntityShareMutationsAcceptMutation($id: UUID!) {
        acceptEntityShare(id: $id) {
          share {
            id
            status
            updatedAt
          }
        }
      }
    `);
  const rejectMutation =
    useMutationWithPromise<useEntityShareMutationsRejectMutation>(graphql`
      mutation useEntityShareMutationsRejectMutation($id: UUID!) {
        rejectEntityShare(id: $id) {
          share {
            id
            status
            updatedAt
          }
        }
      }
    `);
  const cancelMutation =
    useMutationWithPromise<useEntityShareMutationsCancelMutation>(graphql`
      mutation useEntityShareMutationsCancelMutation($id: UUID!) {
        cancelEntityShare(id: $id) {
          share {
            id
            status
            updatedAt
          }
        }
      }
    `);
  const revokeMutation =
    useMutationWithPromise<useEntityShareMutationsRevokeMutation>(graphql`
      mutation useEntityShareMutationsRevokeMutation($id: UUID!) {
        revokeEntityShare(id: $id) {
          share {
            id
            status
            updatedAt
          }
        }
      }
    `);
  const leaveMutation =
    useMutationWithPromise<useEntityShareMutationsLeaveMutation>(graphql`
      mutation useEntityShareMutationsLeaveMutation($id: UUID!) {
        leaveEntityShare(id: $id) {
          share {
            id
            status
            updatedAt
          }
        }
      }
    `);

  const run =
    (
      mutate: (variables: { id: string }) => Promise<unknown>,
      successKey: string,
    ) =>
    async (shareId: string) => {
      try {
        await mutate({ id: shareId });
        message.success(t(successKey));
      } catch (error) {
        logger.error(error);
        // `useMutationWithPromise` rejects with the GraphQL error array.
        message.error(
          getErrorMessage(Array.isArray(error) ? error[0] : error) ||
            t('dialog.ErrorOccurred'),
        );
        throw error;
      }
    };

  return {
    accept: run(acceptMutation, 'entityShare.AcceptSucceeded'),
    reject: run(rejectMutation, 'entityShare.RejectSucceeded'),
    cancel: run(cancelMutation, 'entityShare.CancelOfferSucceeded'),
    revoke: run(revokeMutation, 'entityShare.RevokeSucceeded'),
    leave: run(leaveMutation, 'entityShare.LeaveSucceeded'),
  };
};

export default useEntityShareMutations;
