/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import { convertToBinaryUnit } from '../../helper';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../../hooks';
import {
  toSessionHistoryParams,
  toShareableFormValues,
  useLaunchSession,
} from '../../hooks/useLaunchSession';
import { useProjectPath } from '../../hooks/useRouteScope';
import { useStartSession } from '../../hooks/useStartSession';
import type { SessionLauncherFormValue } from '../../pages/SessionLauncherPage';
import type { ProjectContext } from '../../types/projectContext';
import EnvVarFormList from '../EnvVarFormList';
import ImageEnvironmentSelectFormItems from '../ImageEnvironmentSelectFormItems';
import PortSelectFormItem from '../PortSelectFormItem';
import BatchSessionFormItems from '../SessionFormItems/BatchSessionFormItems';
import HPCOptimizationFormItems from '../SessionFormItems/HPCOptimizationFormItems';
import ResourceAllocationFormItems, {
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
} from '../SessionFormItems/ResourceAllocationFormItems';
import SessionLauncherStorageStep from '../SessionLauncherStorageStep';
import SessionNameFormItem from '../SessionNameFormItem';
import QuickSessionResourceCards, {
  formatQuickAmount,
} from './QuickSessionResourceCards';
import { Button } from '@lablup/ui-common/Button';
import { Collapsible } from '@lablup/ui-common/Collapsible';
import { Heading } from '@lablup/ui-common/Heading';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIButton,
  BAICard,
  BAIFlex,
  BAIModal,
  type BAIModalProps,
  BAISegmentedControl,
  BAISegmentedControlItem,
  BAISkeleton,
  useBAIBreakpoint,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';

/** Fields shown outside the Advanced section; an error elsewhere opens it. */
const VISIBLE_FIELD_ROOTS = [
  'sessionName',
  'environments',
  'vfolderMounts',
  'sessionType',
];

export interface QuickSessionCreateModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel' | 'footer' | 'title'
> {
  project: ProjectContext;
  /** Launcher-shaped values to start from, e.g. a recent-history entry. */
  initialFormValues?: DeepPartial<SessionLauncherFormValue>;
  onRequestClose: (launched?: boolean) => void;
}

const SummaryRow: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <BAIFlex justify="between" gap="sm" align="start">
    <Text type="supporting">{label}</Text>
    <Text>{value}</Text>
  </BAIFlex>
);

const QuickSessionCreateModal: React.FC<QuickSessionCreateModalProps> = ({
  project,
  initialFormValues,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const [form] = Form.useForm<SessionLauncherFormValue>();
  const { md } = useBAIBreakpoint();
  const { defaultFormValues } = useStartSession();
  const { launch } = useLaunchSession();
  const webuiNavigate = useWebUINavigate();
  const baiClient = useSuspendedBackendaiClient();
  const buildProjectPath = useProjectPath();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const initialValues = _.merge(
    {},
    defaultFormValues,
    RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
    initialFormValues,
  ) as SessionLauncherFormValue;

  const watched: Partial<SessionLauncherFormValue> =
    Form.useWatch([], { form, preserve: true }) ?? {};
  const sessionType = watched.sessionType ?? initialValues.sessionType;

  const handleStart = async () => {
    const values = await form.validateFields().catch((error) => {
      const hasHiddenError = _.some(
        error?.errorFields,
        (field: { name: Array<string | number> }) =>
          !VISIBLE_FIELD_ROOTS.includes(String(field.name[0])) &&
          !_.isEqual(field.name, ['batch', 'command']),
      );
      if (hasHiddenError) setIsAdvancedOpen(true);
      return undefined;
    });
    if (!values) return;
    const allValues = { ...form.getFieldsValue(true), ...values };
    await launch(
      { ...allValues, projectName: project.name },
      {
        history: { params: toSessionHistoryParams(allValues) },
        onSuccess: () => onRequestClose(true),
      },
    );
  };

  const continueInLauncher = () => {
    const params = new URLSearchParams({
      formValues: JSON.stringify(
        toShareableFormValues(form.getFieldsValue(true)),
      ),
    });
    onRequestClose();
    webuiNavigate(`${buildProjectPath('session/start')}?${params.toString()}`);
  };

  const resource = watched.resource;
  const memGiB = resource?.mem
    ? convertToBinaryUnit(resource.mem, 'g', 6)?.number
    : undefined;
  const imageName =
    watched.environments?.manual ||
    watched.environments?.version ||
    watched.environments?.environment;
  const clusterSize =
    watched.cluster_mode === 'multi-node' ? (watched.cluster_size ?? 1) : 1;

  const summary = (
    <BAICard
      size="small"
      title={t('session.quickCreate.Summary')}
      style={md ? { position: 'sticky', top: 0 } : undefined}
    >
      <BAIFlex direction="column" align="stretch" gap="xs">
        <SummaryRow
          label={t('session.launcher.Environments')}
          value={imageName ? _.last(_.split(imageName, '/')) : '-'}
        />
        <SummaryRow
          label="CPU"
          value={resource?.cpu ? `${resource.cpu} Core` : '-'}
        />
        <SummaryRow
          label={t('session.launcher.Memory')}
          value={memGiB ? formatQuickAmount('mem', memGiB) : '-'}
        />
        {resource?.acceleratorType && !!resource.accelerator && (
          <SummaryRow
            label={resource.acceleratorType}
            value={_.round(resource.accelerator, 2)}
          />
        )}
        {clusterSize > 1 && (
          <SummaryRow
            label={t('session.launcher.ClusterSize')}
            value={t('session.quickCreate.PerContainer', {
              count: clusterSize,
            })}
          />
        )}
        <SummaryRow
          label={t('webui.menu.Data&Storage')}
          value={
            _.isEmpty(watched.vfolderMounts)
              ? t('session.quickCreate.NoFolder')
              : _.size(watched.vfolderMounts)
          }
        />
        <SummaryRow
          label={t('session.launcher.SessionType')}
          value={
            sessionType === 'batch'
              ? t('session.launcher.BatchMode')
              : t('session.launcher.InteractiveMode')
          }
        />
      </BAIFlex>
    </BAICard>
  );

  return (
    <BAIModal
      {...modalProps}
      title={t('session.quickCreate.Title')}
      width={1080}
      onCancel={() => onRequestClose()}
      footer={
        <BAIFlex justify="between" align="center" gap="sm" wrap="wrap">
          <Button
            variant="ghost"
            label={t('session.quickCreate.ContinueInLauncher')}
            onClick={continueInLauncher}
            data-testid="quick-create-continue-in-launcher"
          />
          <BAIFlex gap="xs">
            <Button
              variant="secondary"
              label={t('button.Cancel')}
              onClick={() => onRequestClose()}
            />
            <BAIButton
              type="primary"
              action={handleStart}
              data-testid="quick-create-start"
            >
              {t('session.launcher.Start')}
            </BAIButton>
          </BAIFlex>
        </BAIFlex>
      }
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <BAIFlex
          direction={md ? 'row' : 'column'}
          align={md ? 'start' : 'stretch'}
          gap="md"
        >
          <BAIFlex
            direction="column"
            align="stretch"
            gap="md"
            style={{ flex: 2, minWidth: 0, width: md ? undefined : '100%' }}
          >
            <BAIFlex direction="column" align="stretch">
              <Heading level={5}>
                {t('session.quickCreate.NameAndEnvironment')}
              </Heading>
              <SessionNameFormItem />
              <Suspense fallback={<BAISkeleton rows={2} />}>
                <ImageEnvironmentSelectFormItems />
              </Suspense>
            </BAIFlex>

            <BAIFlex direction="column" align="stretch" gap="xs">
              <Heading level={5}>{t('session.quickCreate.Resources')}</Heading>
              <Suspense fallback={<BAISkeleton rows={4} />}>
                <QuickSessionResourceCards project={project} />
              </Suspense>
            </BAIFlex>

            <BAIFlex direction="column" align="stretch">
              <Heading level={5}>{t('webui.menu.Data&Storage')}</Heading>
              <Suspense fallback={<BAISkeleton rows={3} />}>
                <SessionLauncherStorageStep form={form} project={project} />
              </Suspense>
            </BAIFlex>

            <BAIFlex direction="column" align="stretch">
              <Form.Item
                name="sessionType"
                label={t('session.launcher.SessionType')}
              >
                <BAISegmentedControl
                  aria-label={t('session.launcher.SessionType')}
                >
                  <BAISegmentedControlItem
                    value="interactive"
                    label={t('session.launcher.InteractiveMode')}
                  />
                  <BAISegmentedControlItem
                    value="batch"
                    label={t('session.launcher.BatchMode')}
                  />
                </BAISegmentedControl>
              </Form.Item>
              {sessionType === 'batch' && (
                <BatchSessionFormItems part="command" />
              )}
            </BAIFlex>

            <Collapsible
              trigger={t('session.launcher.AdvancedSettings')}
              isOpen={isAdvancedOpen}
              onOpenChange={setIsAdvancedOpen}
              data-testid="quick-create-advanced"
            >
              <BAIFlex direction="column" align="stretch">
                <Suspense fallback={<BAISkeleton rows={4} />}>
                  <ResourceAllocationFormItems
                    project={project}
                    enableAgentSelect={!baiClient._config.hideAgents}
                    enableResourcePresets
                    showRemainingWarning
                  />
                </Suspense>
                {sessionType === 'batch' && (
                  <BatchSessionFormItems part="options" />
                )}
                <Form.Item label={t('session.launcher.EnvironmentVariable')}>
                  <EnvVarFormList
                    name="envvars"
                    formItemProps={{
                      validateTrigger: ['onChange', 'onBlur'],
                    }}
                  />
                </Form.Item>
                <HPCOptimizationFormItems />
                <PortSelectFormItem />
              </BAIFlex>
            </Collapsible>
          </BAIFlex>
          <BAIFlex
            direction="column"
            align="stretch"
            style={{ flex: 1, minWidth: md ? 240 : undefined }}
          >
            {summary}
          </BAIFlex>
        </BAIFlex>
      </Form>
    </BAIModal>
  );
};

export default QuickSessionCreateModal;
