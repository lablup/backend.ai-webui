/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  COMMAND_SHELL_OPTIONS,
  DEFAULT_MODEL_SERVICE_SHELL,
} from '../../helper/modelServiceCommand';
import { useSuspendedBackendaiClient } from '../../hooks';
import { AutoComplete, Collapse, Form, Input, InputNumber, Radio } from 'antd';
import type { FormInstance } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ServiceConfigurationFormItemsProps {
  namePrefix: Array<string | number>;
  /** Per-field placeholder text, grouped to match ModelServiceHealthCheckFormItems. */
  placeholders?: Partial<{
    command: string;
    port: string;
  }>;
}

// Shared between DeploymentAddRevisionModal.tsx (namePrefix: []) and
// AdminDeploymentPresetSettingPageContent.tsx (namePrefix: ['modelDefinition',
// 'models', 0, 'service']) — FR-3474. The caller owns the "does this variant
// read vfolder config files" gate (its data source differs per page) and
// renders this only when that gate is open; this component owns everything
// inside the Collapse. Start Command and Port are both optional on both
// forms (BA-6613): the backend defaults `shell` to `/bin/bash` and the
// submit-mapping layer on each page falls back to a default port, so neither
// field needs a `required` rule here. Shell itself stays required + prefilled
// with the default, below.
//
// No Basic/Advanced toggle: Execution (Shell/Exec) + Shell are always shown
// together with Command/Port — team feedback (devops sync, 2026-08-07) was
// that hiding this behind an "Advanced" switch made the always-shell-wrapped
// Basic mode look like it didn't run through a shell at all, which was the
// actual source of confusion. Showing the real execution mode up front is
// more explicit, at the cost of one more always-visible field.
const ServiceConfigurationFormItems: React.FC<
  ServiceConfigurationFormItemsProps
> = ({ namePrefix, placeholders }) => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const supportsCommandShell = baiClient.supports(
    'model-service-command-string',
  );

  return (
    <Collapse
      size="small"
      defaultActiveKey={['service-config']}
      styles={{ header: { alignItems: 'center' } }}
      items={[
        {
          key: 'service-config',
          // Keep the panel mounted while collapsed so the command fields stay
          // registered and validate on submit (FR-3205).
          forceRender: true,
          label: t('modelService.ServiceConfiguration'),
          children: (
            <>
              {/* Execution/Shell controls need the 26.8.0 command/shell API;
                  on older managers only the plain command input below is
                  shown. */}
              {supportsCommandShell && (
                <BAIFlex gap="sm" align="start">
                  <Form.Item
                    name={[...namePrefix, 'execution']}
                    label={t('modelService.Execution')}
                    tooltip={{
                      // pre-line so the `\n` between the Shell and Exec
                      // descriptions renders as a line break.
                      title: (
                        <span style={{ whiteSpace: 'pre-line' }}>
                          {t('modelService.ExecutionTooltip')}
                        </span>
                      ),
                    }}
                    required
                    rules={[{ required: true }]}
                  >
                    <Radio.Group
                      options={[
                        {
                          label: t('modelService.ExecutionShell'),
                          value: 'shell',
                        },
                        {
                          label: t('modelService.ExecutionExec'),
                          value: 'exec',
                        },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item
                    dependencies={[[...namePrefix, 'execution']]}
                    noStyle
                  >
                    {({ getFieldValue: getExec }: FormInstance) =>
                      // Exec = no shell → hide the Shell field entirely
                      // (submitted `shell` is null).
                      getExec([...namePrefix, 'execution']) ===
                      'exec' ? null : (
                        <Form.Item
                          name={[...namePrefix, 'shell']}
                          label={t('modelService.Shell')}
                          tooltip={t('modelService.ShellTooltip')}
                          style={{ flex: 1 }}
                          required
                          rules={[{ required: true, whitespace: true }]}
                        >
                          <AutoComplete
                            placeholder={DEFAULT_MODEL_SERVICE_SHELL}
                            options={COMMAND_SHELL_OPTIONS}
                            allowClear
                          />
                        </Form.Item>
                      )
                    }
                  </Form.Item>
                </BAIFlex>
              )}
              {/* Command input: multi-line textarea in Shell mode (backend
                  runs `shell -c command`, so operators work); single-line
                  input in Exec mode (shell is null → command run directly as
                  argv, so operators do NOT work). Legacy (<26.8.0) managers
                  get a plain single-line input that is tokenized on submit. */}
              <Form.Item dependencies={[[...namePrefix, 'execution']]} noStyle>
                {({ getFieldValue: getMode }: FormInstance) => {
                  const isExec =
                    supportsCommandShell &&
                    getMode([...namePrefix, 'execution']) === 'exec';
                  return (
                    <Form.Item
                      name={[...namePrefix, 'startCommand']}
                      // Exec splits the input into an argv vector, so label
                      // it "Command (argv)" to distinguish it from a shell
                      // command.
                      label={
                        isExec
                          ? t('modelService.CommandArgvLabel')
                          : supportsCommandShell
                            ? t('modelService.Command')
                            : t('modelService.StartCommand')
                      }
                      tooltip={t('modelService.StartCommandTooltip')}
                      // The hint states how the command will be run.
                      // Managers without the command/shell path still
                      // receive a tokenized `startCommand`, so they keep the
                      // original shell-syntax hint (FR-3166).
                      extra={
                        !supportsCommandShell
                          ? t('modelService.StartCommandHelperShell')
                          : isExec
                            ? t('modelService.CommandExecHelper')
                            : t('modelService.CommandShellHelper')
                      }
                      // The command is sent to the server as the raw string
                      // the user typed; the WebUI does not pre-validate shell
                      // operators (Exec runs it via shlex.split, where quoted
                      // operators are valid argv content). Optional (BA-6613):
                      // only guard against whitespace-only input.
                      rules={[{ whitespace: true }]}
                    >
                      {!supportsCommandShell ? (
                        // Legacy (<26.8.0): plain single-line input,
                        // tokenized on submit.
                        <Input placeholder={placeholders?.command} />
                      ) : isExec ? (
                        // Exec: argv example, no shell operators.
                        <Input placeholder={placeholders?.command} />
                      ) : (
                        <Input.TextArea
                          placeholder={placeholders?.command}
                          autoSize={{ minRows: 2 }}
                        />
                      )}
                    </Form.Item>
                  );
                }}
              </Form.Item>
              <Form.Item
                name={[...namePrefix, 'port']}
                label={t('modelService.Port')}
                tooltip={t('modelService.PortTooltip')}
                style={{ marginBottom: 0 }}
              >
                <InputNumber
                  min={2}
                  max={65535}
                  placeholder={placeholders?.port}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </>
          ),
        },
      ]}
    />
  );
};

export default ServiceConfigurationFormItems;
