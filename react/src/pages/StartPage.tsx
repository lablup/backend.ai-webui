import BAIStartBasicCard from '../components/BAIStartBasicCard';
import { useWebComponentInfo } from '../components/DefaultProviders';
import Flex from '../components/Flex';
import BatchSessionIcon from '../components/icons/BatchSessionIcon';
import ExampleStartIcon from '../components/icons/ExampleStart';
import InteractiveSessionIcon from '../components/icons/InteractiveSession';
import ModelServiceIcon from '../components/icons/ModelServiceIcon';
// import RecalculateResourcesIcon from '../components/icons/RecalculateResourcesIcon';
import UpdateEnvironmentImageIcon from '../components/icons/UpdateEnvironmentImageIcon';
// import URLStartIcon from '../components/icons/URLStartIcon';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { FolderAddOutlined, HddOutlined } from '@ant-design/icons';
import { App } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface StartPageProps {}

const StartPage: React.FC<StartPageProps> = (props) => {
  const webuiNavigate = useWebUINavigate();
  const baiClient = useSuspendedBackendaiClient();
  const { t } = useTranslation();
  const app = App.useApp();
  const { upsertNotification } = useSetBAINotification();

  const recalculateUsage = useTanMutation({
    mutationFn: () => {
      return baiClient.recalculate_usage;
    },
  });

  const rescanImage = async (hostname?: string) => {
    // const indicator: any =
    //   // @ts-ignore
    //   await globalThis.lablupIndicator.start('indeterminate');

    // indicator.set(10, t('registry.UpdatingRegistryInfo'));
    const notiKey = upsertNotification({
      // key: notiKey,
      message: `${hostname} ${t('maintenance.RescanImages')}`,
      description: t('registry.UpdatingRegistryInfo'),
      open: true,
      backgroundTask: {
        status: 'pending',
      },
      duration: 0,
    });
    const handleReScanError = (err: any) => {
      console.log(err);
      upsertNotification({
        key: notiKey,
        backgroundTask: {
          status: 'rejected',
        },
        duration: 1,
      });
      if (err && err.message) {
        // @ts-ignore
        globalThis.lablupNotification.text = painKiller.relieve(err.title);
        // @ts-ignore
        globalThis.lablupNotification.detail = err.message;
        // @ts-ignore
        globalThis.lablupNotification.show(true, err);
      }
    };
    baiClient.maintenance
      .rescan_images(hostname)
      .then(({ rescan_images }: any) => {
        if (rescan_images.ok) {
          upsertNotification({
            key: notiKey,
            backgroundTask: {
              status: 'pending',
              percent: 0,
              taskId: rescan_images.task_id,
              statusDescriptions: {
                pending: t('registry.RescanImages'),
                resolved: t('registry.RegistryUpdateFinished'),
                rejected: t('registry.RegistryUpdateFailed'),
              },
            },
          });
          // indicator.set(0, t('registry.RescanImages'));
          // const sse: EventSource = baiClient.maintenance.attach_background_task(
          //   rescan_images.task_id,
          // );
          // sse.addEventListener('bgtask_updated', (e) => {
          //   const data = JSON.parse(e['data']);
          //   const ratio = data.current_progress / data.total_progress;
          //   indicator.set(100 * ratio, t('registry.RescanImages'));
          // });
          // sse.addEventListener('bgtask_done', () => {
          //   const event = new CustomEvent('image-rescanned');
          //   document.dispatchEvent(event);
          //   indicator.set(100, t('registry.RegistryUpdateFinished'));
          //   sse.close();
          // });
          // sse.addEventListener('bgtask_failed', (e) => {
          //   console.log('bgtask_failed', e['data']);
          //   sse.close();
          //   handleReScanError(
          //     new Error('Background Image scanning task has failed'),
          //   );
          // });
          // sse.addEventListener('bgtask_cancelled', () => {
          //   sse.close();
          //   handleReScanError(
          //     new Error('Background Image scanning task has been cancelled'),
          //   );
          // });
        } else {
          upsertNotification({
            key: notiKey,
            backgroundTask: {
              status: 'rejected',
            },
            duration: 1,
          });
          // indicator.set(50, t('registry.RegistryUpdateFailed'));
          // indicator.end(1000);
          // TODO: handle notification in react side
          // @ts-ignore
          // globalThis.lablupNotification.text = painKiller.relieve(
          //   rescan_images.msg,
          // );
          // @ts-ignore
          // globalThis.lablupNotification.detail = rescan_images.msg;
          // @ts-ignore
          // globalThis.lablupNotification.show();
        }
      })
      .catch(handleReScanError);
  };
  return baiClient.is_admin ? (
    <Flex gap={'lg'} wrap="wrap" direction="row" align="start">
      <BAIStartBasicCard
        icon={<HddOutlined />}
        title={
          <div>
            Monitor System
            <br />
            Resources
          </div>
        }
        description={
          'View how the system and agents are performing through the system dashboard.'
        }
        footerButtonProps={{
          onClick: () => {
            webuiNavigate('/system_overview');
          },
          children: 'View Resources',
        }}
      />
      <BAIStartBasicCard
        icon={
          // FIXME: workaround for displaying proper icon
          <img
            src="/resources/icons/RecalculateResources.svg"
            alt="Recalculate Resources"
          ></img>
          // <RecalculateResourcesIcon />
        }
        title={
          <div>
            Recalculate
            <br />
            Resources
          </div>
        }
        description={
          'Is there a difference between the resources allocated and the displayed amount? Please sync up the resources for accurate calculations.'
        }
        footerButtonProps={{
          onClick: () => {
            recalculateUsage.mutate(undefined, {
              onSuccess: () => {
                app.message.success(t('maintenance.RecalculationFinished'));
              },
              onError: (error) => {
                console.log(error);
                app.message.error(t('maintenance.RecalculationFailed'));
              },
            });
          },
          children: (
            <>
              <div style={{ lineHeight: 1 }}>
                Recalculate
                <br />
                Resources
              </div>
            </>
          ),
        }}
      />
      <BAIStartBasicCard
        icon={<UpdateEnvironmentImageIcon />}
        title={
          <div>
            Update Environment
            <br />
            Images
          </div>
        }
        description={
          'Have you installed a new image or added a registry? Click the button to update the list of running images.'
        }
        footerButtonProps={{
          onClick: () => {
            rescanImage();
          },
          children: 'Update Images',
        }}
      />
    </Flex>
  ) : (
    <Flex gap={16} wrap="wrap" direction="column" align="start">
      <Flex gap={16} wrap="wrap">
        <BAIStartBasicCard
          icon={<FolderAddOutlined />}
          title={
            <div>
              Create a New
              <br />
              Storage Folder
            </div>
          }
          description="Creating a folder and uploading files are crucial for training models or providing services externally. Please begin by uploading the files."
          footerButtonProps={{
            onClick: () => {
              webuiNavigate('/data');
            },
            children: 'Create Folder',
          }}
        />
        <BAIStartBasicCard
          icon={<InteractiveSessionIcon />}
          title={
            <div>
              Start an
              <br />
              Interactive Session
            </div>
          }
          description="Want to train a model? Click the button to create a session instantly. Choose your preferred environment and resources for running code and other tasks."
          footerButtonProps={{
            onClick: () => {
              webuiNavigate('/session/start');
            },
            children: 'Start Session',
          }}
        />
        <BAIStartBasicCard
          icon={<BatchSessionIcon />}
          title={
            <div>
              Start a<br />
              Batch Session
            </div>
          }
          description="For predefined files or scheduled tasks, try Batch sessions. Enter the command, set the date and time, and run as needed."
          footerButtonProps={{
            onClick: () => {
              webuiNavigate(
                '/session/start?formValues=%7B%22sessionType%22%3A%22batch%22%2C%22environments%22%3A%7B%22environment%22%3A%22cr.backend.ai%2Fmultiarch%2Fpython%22%2C%22version%22%3A%22cr.backend.ai%2Fmultiarch%2Fpython%3A3.9-ubuntu20.04%40x86_64%22%7D%2C%22envvars%22%3A%5B%5D%2C%22resourceGroup%22%3A%22default%22%2C%22allocationPreset%22%3A%22cpu01-small%22%2C%22resource%22%3A%7B%22cpu%22%3A1%2C%22mem%22%3A%221G%22%2C%22shmem%22%3A%2264m%22%2C%22accelerator%22%3A0%7D%2C%22enabledAutomaticShmem%22%3Atrue%2C%22num_of_sessions%22%3A1%2C%22cluster_mode%22%3A%22single-node%22%2C%22cluster_size%22%3A1%2C%22hpcOptimization%22%3A%7B%22autoEnabled%22%3Atrue%2C%22OMP_NUM_THREADS%22%3A%221%22%2C%22OPENBLAS_NUM_THREADS%22%3A%221%22%7D%2C%22vfoldersAliasMap%22%3A%7B%7D%2C%22batch%22%3A%7B%22enabled%22%3Afalse%7D%7D',
              );
            },
            children: 'Start Session',
          }}
        />
      </Flex>
      <Flex gap={16} wrap="wrap">
        <BAIStartBasicCard
          secondary
          icon={<ModelServiceIcon />}
          title={
            <div>
              Start a
              <br /> Model Service
            </div>
          }
          description="Ready to share your trained model with others? Click the button to create a service."
          footerButtonProps={{
            onClick: () => {
              webuiNavigate('/serving');
            },
            children: 'Start Service',
          }}
        />
        <BAIStartBasicCard
          secondary
          icon={<ExampleStartIcon />}
          title={
            <div>
              Start
              <br />
              from the Example
            </div>
          }
          description="Explore various example codes and get started."
          footerButtonProps={{
            children: 'Start Now',
          }}
        />
        <BAIStartBasicCard
          secondary
          icon={
            // FIXME: workaround for displaying proper icon
            <img src="/resources/icons/URLStart.svg" alt="URL start"></img>
            // <URLStartIcon />
          }
          title={
            <div>
              Start
              <br />
              from a URL
            </div>
          }
          description="Import your project and code from various environments such as GitHub, GitLab, Notebook, etc."
          footerButtonProps={{
            children: 'Start Now',
          }}
        />
      </Flex>
      {/* <BAIStartSimpleCard
        icon={<SessionsIcon />}
        title={'Create a Session'}
        footerButtonProps={{
          onClick: () => {
            webuiNavigate('/session/start');
          },
          children: 'Start Session',
        }}
      /> */}
    </Flex>
  );
};
export default StartPage;
