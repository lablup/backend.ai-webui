import { baiSignedRequestWithPromise, compareNumberWithUnits } from '../helper';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import Flex from './Flex';
import FlexActivityIndicator from './FlexActivityIndicator';
import {
  MountOptionType,
  ServiceCreateType,
  ServiceLauncherFormValue,
} from './ServiceLauncherPageContent';
import ValidationStatusTag from './ValidationStatusTag';
import { AnsiUp } from 'ansi_up';
import { App, Tag, theme } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ServiceValidationModalProps {
  serviceData: any;
}

const ServiceValidationView: React.FC<ServiceValidationModalProps> = ({
  serviceData,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [validationStatus, setValidationStatus] = useState('');
  const [containerLogSummary, setContainerLogSummary] = useState('');
  const [validationTime, setValidationTime] = useState('Before validation');
  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();

  async function getLogs(sessionId: string) {
    return baiClient
      .get_logs(sessionId, baiClient._config.accessKey)
      .then((req: any) => {
        const ansi_up = new AnsiUp();
        const logs = ansi_up.ansi_to_html(req.result.logs);
        return logs;
      });
  }

  const mutationsToValidateService = useTanMutation<
    unknown,
    {
      message?: string;
    },
    ServiceLauncherFormValue
  >({
    mutationFn: (values) => {
      const image: string = `${values.environments.image?.registry}/${values.environments.image?.namespace ?? values.environments.image?.name}:${values.environments.image?.tag}`;
      const body: ServiceCreateType = {
        name: values.serviceName,
        ...(baiClient.supports('replicas')
          ? { replicas: values.replicas }
          : {
              desired_session_count: values.replicas,
            }),
        image: image,
        runtime_variant: values.runtimeVariant,
        architecture: values.environments.image?.architecture as string,
        group: baiClient.current_group, // current Project Group,
        domain: currentDomain, // current Domain Group,
        cluster_size: values.cluster_size,
        cluster_mode: values.cluster_mode,
        open_to_public: values.openToPublic,
        config: {
          model: values.vFolderID,
          model_version: 1, // FIXME: hardcoded. change it with option later
          ...(baiClient.supports('endpoint-extra-mounts') && {
            extra_mounts: _.reduce(
              values.mounts,
              (acc, key: string) => {
                acc[key] = {
                  ...(values.vfoldersAliasMap[key] && {
                    mount_destination: values.vfoldersAliasMap[key],
                  }),
                  type: 'bind', // FIXME: hardcoded. change it with option later
                };
                return acc;
              },
              {} as Record<string, MountOptionType>,
            ),
          }),
          model_definition_path: values.modelDefinitionPath,
          model_mount_destination: baiClient.supports('endpoint-extra-mounts')
            ? values.modelMountDestination
            : '/models',
          environ: {}, // FIXME: hardcoded. change it with option later
          scaling_group: values.resourceGroup,
          resources: {
            // FIXME: manually convert to string since server-side only allows [str,str] tuple
            cpu: values.resource.cpu.toString(),
            mem: values.resource.mem,
            ...(values.resource.accelerator > 0
              ? {
                  [values.resource.acceleratorType]:
                    values.resource.accelerator,
                }
              : undefined),
          },
          resource_opts: {
            shmem:
              compareNumberWithUnits(values.resource.mem, '4g') > 0 &&
              compareNumberWithUnits(values.resource.shmem, '1g') < 0
                ? '1g'
                : values.resource.shmem,
          },
        },
      };

      return baiSignedRequestWithPromise({
        method: 'POST',
        url: '/services/_/try',
        body,
        client: baiClient,
      });
    },
  });

  const isRunningRef = useRef<boolean>(false);
  useEffect(() => {
    if (isRunningRef.current) return;

    const validationDateTime = dayjs().format('LLL');

    let sse: EventSource | undefined = undefined;

    mutationsToValidateService
      .mutateAsync(serviceData)
      .then((data: any) => {
        setValidationTime(validationDateTime);
        // setContainerLogSummary('loading...');
        const response = data;
        sse = baiClient.maintenance.attach_background_task(response['task_id']);

        // TODO:
        const timeoutId = setTimeout(() => {
          sse?.close();
          // something went wrong during validation
          setValidationStatus('error');
          message.error(t('modelService.CannotValidateNow'));
        }, 10000);

        sse?.addEventListener('bgtask_updated', async (e) => {
          const data = JSON.parse(e['data']);
          const msg = JSON.parse(data.message);
          if (['session_started', 'session_terminated'].includes(msg.event)) {
            const logs = await getLogs(msg.session_id);
            setContainerLogSummary(logs);
            clearTimeout(timeoutId);
            // temporally close sse manually when session is terminated
            if (msg.event === 'session_terminated') {
              sse?.close();
              return;
            }
          }
          setValidationStatus('processing');
        });
        sse?.addEventListener('bgtask_done', async (e) => {
          setValidationStatus('finished');
          clearTimeout(timeoutId);
          sse?.close();
        });
        sse?.addEventListener('bgtask_failed', async (e) => {
          const data = JSON.parse(e['data']);
          const msg = JSON.parse(data.message);
          const logs = await getLogs(msg.session_id);
          setContainerLogSummary(logs);
          setValidationStatus('error');
          sse?.close();
          throw new Error(e['data']);
        });
        sse?.addEventListener('bgtask_cancelled', async (e) => {
          setValidationStatus('error');
          sse?.close();
          throw new Error(e['data']);
        });
      })
      .catch((error) => {
        message.error(
          error?.message
            ? _.truncate(error?.message, { length: 200 })
            : t('modelService.FormValidationFailed'),
        );
      })
      .finally(() => {
        isRunningRef.current = false;
      });
    isRunningRef.current = true;

    return () => {
      sse?.close();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Suspense fallback={<FlexActivityIndicator />}>
      <Flex direction="row" justify="between" align="center">
        <h3>{t('modelService.Result')}</h3>
        <ValidationStatusTag status={validationStatus}></ValidationStatusTag>
      </Flex>
      <Flex direction="row" justify="between" align="center">
        <h3>{t('modelService.TimeStamp')}</h3>
        <Tag>{validationTime}</Tag>
      </Flex>
      <h3>{t('modelService.SeeContainerLogs')}</h3>
      <Flex
        direction="column"
        justify="start"
        align="start"
        style={{
          overflowX: 'scroll',
          color: 'white',
          backgroundColor: 'black',
          padding: token.paddingSM,
          borderRadius: token.borderRadius,
        }}
      >
        <pre dangerouslySetInnerHTML={{ __html: containerLogSummary }} />
      </Flex>
    </Suspense>
  );
};

export default ServiceValidationView;
