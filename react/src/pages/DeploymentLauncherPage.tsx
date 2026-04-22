/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentLauncherPageCreateMutation } from '../__generated__/DeploymentLauncherPageCreateMutation.graphql';
import { DeploymentLauncherPageEditMutation } from '../__generated__/DeploymentLauncherPageEditMutation.graphql';
import { DeploymentLauncherPageQuery } from '../__generated__/DeploymentLauncherPageQuery.graphql';
import DeploymentLauncherPageContent, {
  DeploymentLauncherFormValue,
} from '../components/DeploymentLauncherPageContent';
import {
  useCurrentDomainValue,
  useSuspendedBackendaiClient,
  useWebUINavigate,
} from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import { App, Form, Skeleton, Typography, theme } from 'antd';
import {
  BAIButton,
  BAIFlex,
  toGlobalId,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

/**
 * DeploymentLauncherPage — page-level orchestrator for the deployment launcher.
 *
 * Handles both create (`/deployments/new`) and edit
 * (`/deployments/:deploymentId/edit`) routes. Owns:
 *   - Relay `useLazyLoadQuery` for the edit-mode deployment snapshot.
 *   - The antd `FormInstance` that the content component binds to.
 *   - `createModelDeployment` / `addModelRevision` mutations.
 *   - Submit/Cancel buttons and navigation on success.
 *
 * Delegates the multi-step form body to `DeploymentLauncherPageContent`
 * (see FR-2674), which is responsible for the card layout, step navigation,
 * and per-field validation.
 */
const DeploymentLauncherPage: React.FC = () => {
  'use memo';

  const { deploymentId } = useParams<{ deploymentId?: string }>();
  const mode: 'create' | 'edit' = deploymentId ? 'edit' : 'create';

  return (
    <Suspense fallback={<Skeleton active />}>
      {mode === 'edit' && deploymentId ? (
        <DeploymentLauncherEditView deploymentId={deploymentId} />
      ) : (
        <DeploymentLauncherCreateView />
      )}
    </Suspense>
  );
};

/**
 * Create-mode view — no deployment fragment to pre-fill from. Reads the
 * optional `?model=<folderId>` query param for Quick Deploy / model store
 * entry points and forwards it to the content component.
 */
const DeploymentLauncherCreateView: React.FC = () => {
  'use memo';
  const [searchParams] = useSearchParams();
  const preFilledModel = searchParams.get('model') ?? undefined;
  const [form] = Form.useForm<DeploymentLauncherFormValue>();

  return (
    <DeploymentLauncherPageLayout
      mode="create"
      form={form}
      preFilledModel={preFilledModel}
    />
  );
};

/**
 * Edit-mode view — fetches the deployment by id and passes the fragment
 * reference down so the content component can pre-fill the form from the
 * current active revision.
 */
const DeploymentLauncherEditView: React.FC<{ deploymentId: string }> = ({
  deploymentId,
}) => {
  'use memo';
  const [form] = Form.useForm<DeploymentLauncherFormValue>();

  // The route param is the local (UUID) id; the Strawberry `deployment`
  // query accepts a global ID, so we encode it here. If the caller
  // already passed a base64 global id (legacy /serving/:id redirect)
  // we tolerate that by round-tripping through toLocalId first.
  const globalId = /^[A-Za-z0-9+/=]+$/.test(deploymentId)
    ? toGlobalId('ModelDeployment', toLocalId(deploymentId) ?? deploymentId)
    : toGlobalId('ModelDeployment', deploymentId);

  const { deployment } = useLazyLoadQuery<DeploymentLauncherPageQuery>(
    graphql`
      query DeploymentLauncherPageQuery($deploymentId: ID!) {
        deployment(id: $deploymentId) {
          id
          ...DeploymentLauncherPageContent_deployment
        }
      }
    `,
    { deploymentId: globalId },
    { fetchPolicy: 'store-and-network' },
  );

  return (
    <DeploymentLauncherPageLayout
      mode="edit"
      form={form}
      deploymentId={deploymentId}
      deploymentFrgmt={deployment ?? null}
    />
  );
};

interface DeploymentLauncherPageLayoutProps {
  mode: 'create' | 'edit';
  form: ReturnType<typeof Form.useForm<DeploymentLauncherFormValue>>[0];
  deploymentId?: string;
  deploymentFrgmt?: React.ComponentProps<
    typeof DeploymentLauncherPageContent
  >['deploymentFrgmt'];
  preFilledModel?: string;
}

/**
 * Shared chrome for both create and edit modes. Owns the submit + cancel
 * buttons, mutation wiring, and navigation. Relies on the content
 * component for step rendering and per-field validation.
 */
const DeploymentLauncherPageLayout: React.FC<
  DeploymentLauncherPageLayoutProps
> = ({ mode, form, deploymentId, deploymentFrgmt, preFilledModel }) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const webuiNavigate = useWebUINavigate();
  const app = App.useApp();
  const { logger } = useBAILogger();

  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const { id: projectId } = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const { upsertNotification } = useSetBAINotification();

  // Track form dirtiness to guard cancel with a confirm dialog. We use
  // form.isFieldsTouched() via a lightweight state mirror so the button
  // can react to edits without forcing the whole page to re-render on
  // every keystroke (`onValuesChange` on the content form updates it).
  const [isDirty, setIsDirty] = React.useState(false);

  const [commitCreate, isCreating] =
    useMutation<DeploymentLauncherPageCreateMutation>(graphql`
      mutation DeploymentLauncherPageCreateMutation(
        $input: CreateDeploymentInput!
      ) {
        createModelDeployment(input: $input) {
          deployment {
            id
            metadata {
              name
            }
          }
        }
      }
    `);

  const [commitEdit, isEditing] =
    useMutation<DeploymentLauncherPageEditMutation>(graphql`
      mutation DeploymentLauncherPageEditMutation($input: AddRevisionInput!) {
        addModelRevision(input: $input) {
          revision {
            id
          }
        }
      }
    `);

  const isSubmitting = isCreating || isEditing;

  const navigateBack = () => {
    if (mode === 'edit' && deploymentId) {
      navigate(`/deployments/${deploymentId}`);
    } else {
      navigate('/deployments');
    }
  };

  const handleCancel = async () => {
    if (isDirty) {
      const ok = await app.modal.confirm({
        title: t('dialog.title.Notice'),
        content: t('dialog.ask.DoYouWantToResetChanges'),
        closable: true,
      });
      if (!ok) return;
    }
    navigateBack();
  };

  /**
   * Build the `CreateDeploymentInput` payload from the form values.
   *
   * TODO(needs-backend): FR-2675 — the content form currently exposes
   * `image` as a canonical name string, `resourceGroup` as a plain string,
   * and does not yet collect `resourceSlots`. These map to GQL inputs
   * (`ImageInput.id`, `ResourceGroupInput`, `ResourceSlotInput`) that
   * require additional lookups against the image / resource-group APIs.
   * Until those lookups land we send `initialRevision: null` for create
   * (schema allows it) and rely on the user to chain a follow-up
   * `addModelRevision` for the runtime config, matching FR-2683's
   * Quick Deploy behavior.
   */
  const handleCreate = async (values: DeploymentLauncherFormValue) => {
    if (!projectId) {
      throw new Error('No current project selected.');
    }
    return new Promise<string>((resolve, reject) => {
      commitCreate({
        variables: {
          input: {
            metadata: {
              projectId,
              domainName: currentDomain,
              name: values.name,
              tags: values.tags?.length ? values.tags : null,
            },
            networkAccess: {
              preferredDomainName: null,
              openToPublic: values.openToPublic,
            },
            defaultDeploymentStrategy: { type: 'ROLLING' },
            desiredReplicaCount: values.desiredReplicaCount,
            // TODO(needs-backend): FR-2675 — once the form collects
            // image id + resource slots, build `initialRevision` here
            // instead of leaving it null. Today the content form only
            // carries canonical image names so we defer the revision to
            // a follow-up `addModelRevision` once wiring lands.
            initialRevision: null,
          },
        },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            reject(new Error(errors.map((e) => e.message).join('\n')));
            return;
          }
          const id = toLocalId(response.createModelDeployment.deployment.id);
          resolve(id);
        },
        onError: (err) => reject(err),
      });
    });
  };

  const handleEdit = async (
    values: DeploymentLauncherFormValue,
  ): Promise<string> => {
    if (!deploymentId) {
      throw new Error('No deployment id for edit.');
    }
    // TODO(needs-backend): FR-2675 — `AddRevisionInput` requires
    // non-null `resourceConfig` (with `resourceGroup` + `resourceSlots`)
    // and `image.id`. The content form currently collects the image by
    // canonical name and the resource group by name only, so we cannot
    // build a well-typed payload end-to-end without additional lookups
    // against the image and resource-group APIs. Once those lookups
    // land, construct the `AddRevisionInput` here and call
    // `commitEdit({ variables: { input: ... } })`.
    //
    // For now we fail fast with a descriptive error so the edit button
    // in the UI is clearly surfacing "wired but not implemented" rather
    // than silently no-op'ing.
    void commitEdit;
    void values;
    throw new Error(
      'addModelRevision wiring pending — tracked as TODO(needs-backend) in FR-2675.',
    );
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Edit mode: surface a confirm dialog that explains the new-revision
      // semantics before firing the mutation, per spec §Flow 4.
      if (mode === 'edit') {
        const confirmed = await app.modal.confirm({
          title: t('deployment.EditDeployment'),
          content: t('deployment.NewRevisionWillBeCreatedConfirm'),
          okText: t('button.Save'),
          cancelText: t('button.Cancel'),
          closable: true,
        });
        if (!confirmed) return;
      }

      const notificationKey = `deployment-launcher-${deploymentId ?? values.name}-${Date.now()}`;
      upsertNotification({
        key: notificationKey,
        open: true,
        // `modelService.StartingModelService` reads as a generic "service
        // is starting…" in both create and edit flows (edit → rolls out
        // a new revision), which is close enough to the UX we want
        // without minting a second string. When the revision-specific
        // wording is finalized we can split this into two keys.
        message: t('modelService.StartingModelService'),
        description: null,
        duration: 0,
        backgroundTask: { status: 'pending', percent: 0 },
      });

      try {
        const newId =
          mode === 'edit'
            ? (await handleEdit(values), deploymentId!)
            : await handleCreate(values);

        upsertNotification({
          key: notificationKey,
          open: true,
          message:
            mode === 'edit'
              ? t('deployment.DeploymentUpdated')
              : t('deployment.DeploymentCreated'),
          description: null,
          duration: 2,
          backgroundTask: { status: 'resolved', percent: 100 },
        });
        setIsDirty(false);
        // Navigate via webuiNavigate so legacy listeners get a chance to
        // tear down before the detail page mounts (mirrors FR-2683).
        webuiNavigate(`/deployments/${newId}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error('[DeploymentLauncherPage] submit failed', err);
        upsertNotification({
          key: notificationKey,
          open: true,
          message:
            mode === 'edit'
              ? t('deployment.FailedToUpdateDeployment')
              : t('deployment.FailedToCreateDeployment'),
          description: msg,
          duration: 0,
          backgroundTask: { status: 'rejected', percent: 99 },
        });
      }
    } catch {
      // validateFields throws on invalid fields — antd already surfaces
      // the per-field errors; no need to add a toast on top.
    }
  };

  // Suppress unused-variable warnings for scaffolding-only helpers.
  void baiClient;
  void currentResourceGroup;

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="md"
      style={{ paddingBottom: token.paddingContentVerticalLG }}
    >
      <BAIFlex direction="row" justify="between" align="center">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {mode === 'edit'
            ? t('deployment.EditDeployment')
            : t('deployment.NewDeployment')}
        </Typography.Title>
      </BAIFlex>

      <DeploymentLauncherPageContent
        mode={mode}
        form={form}
        deploymentFrgmt={deploymentFrgmt}
        preFilledModel={preFilledModel}
        onValuesChange={() => setIsDirty(true)}
      />

      <BAIFlex
        direction="row"
        justify="end"
        gap="sm"
        style={{ marginTop: token.marginLG }}
      >
        <BAIButton onClick={handleCancel} disabled={isSubmitting}>
          {t('button.Cancel')}
        </BAIButton>
        <BAIButton type="primary" loading={isSubmitting} action={handleSubmit}>
          {mode === 'edit'
            ? t('deployment.UpdateDeployment')
            : t('deployment.CreateDeployment')}
        </BAIButton>
      </BAIFlex>
    </BAIFlex>
  );
};

export default DeploymentLauncherPage;
