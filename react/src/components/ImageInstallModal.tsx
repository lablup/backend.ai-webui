/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { addNumberWithUnits } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { usePainKiller } from '../hooks/usePainKiller';
import { useStartSession } from '../hooks/useStartSession';
import { SessionResources } from '../pages/SessionLauncherPage';
import { ProjectContextOrNull } from '../types/projectContext';
import BAIFormItem from './BAIFormItem';
import { EnvironmentImage } from './ImageList';
import ProjectSelect from './ProjectSelect';
import BAISkeletonAstryx from './astryx-bui/BAISkeletonAstryx';
import { List, ListItem } from '@astryxdesign/core/List';
import { Pagination } from '@astryxdesign/core/Pagination';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAIProjectResourceGroupSelect,
  generateRandomString,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Dispatch, SetStateAction, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ImageInstallModalInterface extends BAIModalProps {
  onRequestClose: () => void;
  selectedRows: EnvironmentImage[];
  setInstallingImages: Dispatch<SetStateAction<string[]>>;
}

/**
 * Installing an image is NOT "installing into a project". It enqueues a
 * throwaway batch session whose only job is to pull the image
 * (`startupCommand: 'echo "Image is installed"'`, `enqueueOnly: true`). The
 * pull happens on the AGENT the scheduler binds that kernel to
 * (`sokovan/scheduler/launcher/launcher.py` -> agent RPC `check_and_pull`), and
 * the project never reaches agent-selection code at all.
 *
 * So the two axes this modal asks for differ in kind:
 *
 * - **Resource group** - the axis that actually decides WHERE the image lands,
 *   because it decides which agents the kernel can be bound to. This used to be
 *   hardcoded to `'default'`, which made the real target invisible and
 *   hard-failed with `InvalidAPIParameters: Scaling group 'default' is not
 *   accessible` on any deployment with no reachable group by that name.
 * - **Project** - a permission gate on which resource groups are reachable,
 *   plus the session's owner / accounting bucket.
 *
 * Both are explicit, required choices with no silent default: the point of
 * FR-3415 is that an operator-visible action never resolves its target from
 * something the operator cannot see.
 *
 * This modal deliberately does NOT inherit the image list's project filter.
 * The list filter answers "which images am I looking at"; this modal answers
 * "where does the install session run". Coupling them would make the user
 * change a *filter* in order to enable an *action*.
 *
 * The caller is responsible for wrapping this component in
 * `BAIUnmountAfterClose` (see `ImageList.tsx`) - that is what resets the
 * project / resource-group state on every fresh open (by fully unmounting
 * this component between opens) while still letting the modal play its close
 * animation instead of vanishing instantly.
 */
const ImageInstallModal: React.FC<ImageInstallModalInterface> = ({
  onRequestClose,
  selectedRows,
  setInstallingImages,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { upsertSessionNotification } = useStartSession();
  const painKiller = usePainKiller();
  // antd List `pagination` -> standalone Astryx Pagination (MAPPING.md §4
  // List: built-in pagination has no destination); page size 5 as before.
  const [listPage, setListPage] = useState(1);
  const LIST_PAGE_SIZE = 5;

  const [chosenProject, setChosenProject] =
    useState<ProjectContextOrNull>(null);
  const [chosenResourceGroup, setChosenResourceGroup] = useState<
    string | undefined
  >(undefined);
  // Tracks the in-flight install request. While true, the OK button shows a
  // loading state (`confirmLoading`) and the modal refuses to be dismissed
  // (`closable`/`cancelButtonProps`) so it can't vanish before the requests
  // settle.
  const [isInstalling, setIsInstalling] = useState(false);

  const mapImages = () => {
    let hasInstalledImage = false;
    const imagesToInstall = selectedRows.filter((image) => {
      if (image.installed) hasInstalledImage = true;
      return !image.installed;
    });
    return { imagesToInstall, hasInstalledImage };
  };

  const { imagesToInstall, hasInstalledImage } = mapImages();

  const canInstall = !!chosenProject && !!chosenResourceGroup;

  const handleClick = async () => {
    if (!chosenProject || !chosenResourceGroup) return;
    const installProjectName = chosenProject.name;
    const installResourceGroup = chosenResourceGroup;

    setIsInstalling(true);
    try {
      const installPromises = imagesToInstall.map(async (image, index) => {
        const imageName = `${image?.registry}/${image?.namespace ?? image?.name}:${image?.tag}`;

        const labels = (image?.labels ?? []).reduce<Record<string, string>>(
          (acc, label) => {
            if (label?.key && label?.value) {
              acc[label.key] = label.value;
            }
            return acc;
          },
          {},
        ); // Properly convert labels to a dictionary

        const shmem = labels['ai.backend.resource.preferred.shmem'] || '64m';
        const mem =
          addNumberWithUnits(
            _.get(_.find(image?.resource_limits, { key: 'mem' }), 'min') ??
              '256m',
            shmem,
            'm',
          ) ?? '320m'; // 320m = 256m + 64m

        const imageResource: SessionResources = {
          group_name: installProjectName,
          domain: baiClient._config.domainName,
          type: 'batch',
          cluster_mode: 'single-node',
          cluster_size: 1,
          startupCommand: 'echo "Image is installed"',
          enqueueOnly: true,
          reuseIfExists: false,
          config: {
            resources: {
              ..._.mapValues(_.keyBy(image?.resource_limits, 'key'), 'min'),
              cpu: _.get(
                _.find(image?.resource_limits, { key: 'cpu' }),
                'min',
                1,
              ) as number,
              mem: mem,
            },
            resource_opts: {
              shmem,
            },
            // The agent that pulls the image is picked from this resource
            // group's agents - never a hardcoded `'default'`.
            scaling_group: installResourceGroup,
          },
        };

        const isGPURequired = _.some(
          ['cuda.device', 'cuda.shares'],
          (key) => key in (imageResource.config?.resources ?? {}),
        );

        if (isGPURequired && imageResource.config) {
          _.assign(imageResource.config.resources, {
            gpu: _.get(imageResource.config.resources, 'cuda.device', 0),
            fgpu: _.get(imageResource.config.resources, 'cuda.shares'),
          });
        }

        const resourceSlots = await baiClient.get_resource_slots();

        const keysToRemove = _.filter(
          ['cuda.device', 'cuda.shares', 'gpu', 'fgpu'],
          (key) => !(key in resourceSlots),
        );

        // Remove keys that are not available in the resource slots
        if (imageResource.config) {
          imageResource.config.resources = {
            ..._.omit(imageResource.config.resources ?? {}, keysToRemove),
            cpu: imageResource.config.resources?.cpu ?? 1,
            mem: imageResource.config.resources?.mem ?? '320m',
          };
        }

        // A stable prefix marks this as an install session at a glance; the
        // per-image index + random suffix keeps N images installed in one
        // action from colliding. Deliberately does NOT embed the image name -
        // that's already visible on the image list, and image names are long
        // and contain characters (`/`, `:`) that session names can't hold.
        const installSessionName = `install-image-${generateRandomString(8)}-${index}`;

        try {
          const result = await baiClient.image.install(
            imageName,
            image?.architecture,
            imageResource,
            undefined,
            installSessionName,
          );
          return {
            imageId: image?.id,
            session: {
              sessionId: result?.sessionId,
              sessionName: installSessionName,
              // The install endpoint's response carries no service-port info
              // (it's a throwaway batch session with no exposed app) -
              // `upsertSessionNotification` only reads `.sessionId`, so an
              // empty array satisfies its declared contract without inventing
              // data.
              servicePorts: [],
            },
          };
        } catch (error) {
          document.dispatchEvent(
            new CustomEvent('add-bai-notification', {
              detail: {
                open: true,
                type: 'error',
                message: painKiller.relieve((error as any).title),
                description: (error as any).message,
              },
            }),
          );
          return null;
        }
      });

      // `Promise.allSettled` never rejects, so every install outcome - success
      // or failure - is accounted for here; one image's failure can never
      // strand the modal open waiting on a promise that never resolves.
      const results = await Promise.allSettled(installPromises);
      const succeeded = results.filter(
        (
          result,
        ): result is PromiseFulfilledResult<{
          imageId: string;
          session: {
            sessionId: string;
            sessionName: string;
            servicePorts: never[];
          };
        }> => result.status === 'fulfilled' && result.value !== null,
      );

      setInstallingImages(succeeded.map((result) => result.value.imageId));

      if (succeeded.length > 0) {
        // Standard session-creation notification (FR-3415): each installed
        // image gets its own persistent notification carrying the actual
        // session node, replacing the old 2-second toast that tracked
        // nothing. One failure among several installs must not suppress the
        // others' notifications, hence building this from `succeeded` rather
        // than short-circuiting on the first rejection.
        const successCreations: Parameters<
          typeof upsertSessionNotification
        >[0] = succeeded.map((result) => ({
          status: 'fulfilled',
          value: result.value.session,
        }));
        // Awaited (it is a quick Relay fetch) so the notifications are
        // already on screen by the time the modal closes below.
        await upsertSessionNotification(successCreations);
      }
    } finally {
      // Always clear the in-flight flag and close - including when every
      // install failed - so the modal can never get stuck open.
      setIsInstalling(false);
      onRequestClose();
    }
  };

  return (
    <BAIModal
      {...modalProps}
      maskClosable={false}
      // While a request is in flight, remove every dismissal affordance so
      // the modal can't be closed out from under it: no close icon, and the
      // Cancel button is disabled. `onCancel` also short-circuits so a
      // keyboard Esc can't sneak a close through either.
      closable={!isInstalling}
      cancelButtonProps={{ disabled: isInstalling }}
      confirmLoading={isInstalling}
      onCancel={() => {
        if (isInstalling) return;
        onRequestClose();
      }}
      title={t('environment.CheckImageInstallation')}
      okText={t('environment.Install')}
      okButtonProps={{ disabled: !canInstall }}
      onOk={handleClick}
    >
      <BAIFlex direction="column" gap="md" align="start">
        {hasInstalledImage ? t('environment.InstalledImagesAreExcluded') : null}
        <Text>{t('environment.DescInstallRunsSession')}</Text>
        {/* Both selectors are unconditional: the image list's project filter
            says which images are on screen, not where the install session
            runs. */}
        <div style={{ width: '100%' }}>
          <BAIFormItem
            label={t('environment.InstallSessionProject')}
            tooltip={t('environment.InstallSessionProjectTooltip')}
            required
          >
            {/* The Suspense boundary swallows BAIFormItem's injected props, so
                the values are held in local state instead of the form. */}
            <Suspense fallback={<BAISkeletonAstryx variant="input" />}>
              {/* Deliberately NOT `ProjectSelectForAdminPage`: without
                  `disableDefaultFilter` this lists MEMBER projects only
                  (`ProjectSelect.tsx`). The manager would let a superadmin or
                  domain admin spawn in any active project of the domain
                  (`manager/utils.py` `query_userinfo`), but the session is
                  created as the admin's OWN session and the session list is
                  project-scoped - a project they do not belong to would
                  produce a session they can neither see nor clean up. */}
              <ProjectSelect
                data-testid="image-install-project-select"
                domain={baiClient._config.domainName}
                value={chosenProject?.id ?? undefined}
                onSelectProject={(projectInfo) => {
                  setChosenProject(
                    projectInfo
                      ? {
                          id: projectInfo.projectId,
                          name: projectInfo.projectName,
                        }
                      : null,
                  );
                  // Resource groups are reachable per project, so a group
                  // picked for the previous project may not be reachable from
                  // the new one. Drop it and make the operator choose again.
                  setChosenResourceGroup(undefined);
                }}
              />
            </Suspense>
          </BAIFormItem>
          <BAIFormItem
            label={t('environment.InstallTargetResourceGroup')}
            tooltip={t('environment.InstallTargetResourceGroupTooltip')}
            required
            style={{ marginBottom: 0 }}
          >
            <Suspense fallback={<BAISkeletonAstryx variant="input" />}>
              {/* Project-scoped, so it can only offer groups that pass the
                  manager's `query_allowed_sgroups` check. `autoSelectDefault`
                  is deliberately OFF - silently picking `default` would
                  reintroduce the very invisible choice this change removes. */}
              <BAIProjectResourceGroupSelect
                key={chosenProject?.id ?? 'no-project'}
                data-testid="image-install-resource-group-select"
                projectName={chosenProject?.name ?? ''}
                disabled={!chosenProject}
                value={chosenResourceGroup}
                onChange={(value) => setChosenResourceGroup(value)}
                style={{ width: '100%' }}
              />
            </Suspense>
          </BAIFormItem>
        </div>
        <BAIFlex
          direction="column"
          align="stretch"
          style={{
            width: '100%',
          }}
        >
          {(() => {
            const imageNames = imagesToInstall.map(
              (image) =>
                `${image?.registry}/${image?.namespace ?? image?.name}:${image?.tag}`,
            );
            const pagedNames = imageNames.slice(
              (listPage - 1) * LIST_PAGE_SIZE,
              listPage * LIST_PAGE_SIZE,
            );
            return (
              <>
                <List density="compact" hasDividers>
                  {pagedNames.map((item) => (
                    <ListItem key={item} label={item} />
                  ))}
                </List>
                {imageNames.length > LIST_PAGE_SIZE ? (
                  // PILOT-DECISION: antd's `showTotal` ("Total N items")
                  // becomes Pagination variant="count" (x-y of N) —
                  // equivalent information, Astryx's own phrasing.
                  <Pagination
                    page={listPage}
                    onChange={setListPage}
                    totalItems={imageNames.length}
                    pageSize={LIST_PAGE_SIZE}
                    variant="count"
                    size="sm"
                  />
                ) : null}
              </>
            );
          })()}
        </BAIFlex>
        <Text>
          {t('environment.DescSignificantInstallTime')}&nbsp;
          {t('dialog.ask.DoYouWantToProceed')}
        </Text>
      </BAIFlex>
    </BAIModal>
  );
};
export default ImageInstallModal;
