/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  SSEEventHandlerTypes,
  baiSignedRequestWithPromise,
  compareNumberWithUnits,
  listenToBackgroundTask,
} from '../helper';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import FlexActivityIndicator from './FlexActivityIndicator';
import {
  MountOptionType,
  ServiceCreateType,
  ServiceLauncherFormValue,
} from './ServiceLauncherPageContent';
import ValidationStatusTag from './ValidationStatusTag';
import { AnsiUp } from 'ansi_up';
import { App, Tag, theme } from 'antd';
import {
  BAIFlex,
  ESMClientErrorResponse,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import DOMPurify from 'dompurify';
import _ from 'lodash';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ServiceValidationModalProps {
  serviceData: any;
}
type BackgroundTaskEvent = {
  task_id: string;
  message: string;
  current_progress: number;
  total_progress: number;
};

const ServiceValidationView: React.FC<ServiceValidationModalProps> = ({
  serviceData,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
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
    ESMClientErrorResponse,
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
          extra_mounts: _.reduce(
            values.mount_ids,
            (acc, key: string) => {
              acc[key] = {
                ...(values.mount_id_map[key] && {
                  mount_destination: values.mount_id_map[key],
                }),
                type: 'bind', // FIXME: hardcoded. change it with option later
              };
              return acc;
            },
            {} as Record<string, MountOptionType>,
          ),
          model_definition_path: values.modelDefinitionPath,
          model_mount_destination: values.modelMountDestination,
          environ: {}, // FIXME: hardcoded. change it with option later
          scaling_group: values.resourceGroup,
          resources: {
            // FIXME: manually convert to string since server-side only allows [str,str] tuple
            cpu: values.resource.cpu.toString(),
            mem: values.resource.mem,
            ...(values.resource?.acceleratorType &&
            values.resource?.accelerator &&
            values.resource.accelerator > 0
              ? {
                  [values.resource.acceleratorType]:
                    values.resource.accelerator.toString(),
                }
              : undefined),
          },
          ...(values.resource.shmem && {
            shmem:
              compareNumberWithUnits(values.resource.mem, '4g') > 0 &&
              compareNumberWithUnits(values.resource.shmem, '1g') < 0
                ? '1g'
                : values.resource.shmem,
          }),
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

    mutationsToValidateService
      .mutateAsync(serviceData)
      .then((response: any) => {
        setValidationTime(validationDateTime);

        const timeoutId = setTimeout(() => {
          setValidationStatus('error');
          message.error(t('modelService.CannotValidateNow'));
        }, 60000);

        const SSEEventHandlers: SSEEventHandlerTypes<BackgroundTaskEvent> = {
          onUpdated: async (data, controller) => {
            try {
              setValidationStatus('processing');

              const msg = JSON.parse(data.message);
              if (msg.event === 'session_cancelled') {
                setValidationStatus('error');
                message.error(t('modelService.CannotValidateNow'));
                controller?.abort();
                clearTimeout(timeoutId);
              } else if (
                msg.event === 'session_started' ||
                msg.event === 'session_terminated'
              ) {
                const logs = await getLogs(msg.session_id);
                setContainerLogSummary(logs);
              }
            } catch {
              // ignore errors in log fetching
              return;
            }
          },
          onDone: () => {
            setValidationStatus('finished');
            clearTimeout(timeoutId);
          },
          onFailed: async (data) => {
            const logs = await getLogs(
              JSON.parse(data.message).session_id,
            ).catch(() => undefined);
            logs ?? setContainerLogSummary(logs);
            setValidationStatus('error');
            throw new Error(JSON.parse(data.message).event);
          },
          onTaskCancelled: (data) => {
            setValidationStatus('error');
            throw new Error(JSON.parse(data.message).event);
          },
          onTaskFailed: (data) => {
            setValidationStatus('error');
            throw new Error(JSON.parse(data.message).event);
          },
        };

        listenToBackgroundTask(response['task_id'], SSEEventHandlers);
      })
      .catch((error) => {
        message.error(
          getErrorMessage(error) || t('modelService.FormValidationFailed'),
        );
      })
      .finally(() => {
        isRunningRef.current = false;
      });
    isRunningRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Suspense fallback={<FlexActivityIndicator />}>
      <BAIFlex direction="row" justify="between" align="center">
        <h3>{t('modelService.Result')}</h3>
        <ValidationStatusTag status={validationStatus}></ValidationStatusTag>
      </BAIFlex>
      <BAIFlex direction="row" justify="between" align="center">
        <h3>{t('modelService.TimeStamp')}</h3>
        <Tag>{validationTime}</Tag>
      </BAIFlex>
      <h3>{t('modelService.SeeContainerLogs')}</h3>
      <BAIFlex
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
        <pre
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(containerLogSummary),
          }}
        />
      </BAIFlex>
    </Suspense>
  );
};

export default ServiceValidationView;
