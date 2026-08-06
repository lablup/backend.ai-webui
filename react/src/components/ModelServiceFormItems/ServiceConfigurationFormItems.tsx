/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  COMMAND_SHELL_OPTIONS,
  DEFAULT_MODEL_SERVICE_SHELL,
} from '../../helper/modelServiceCommand';
import { useSuspendedBackendaiClient } from '../../hooks';
import {
  AutoComplete,
  Collapse,
  Form,
  Input,
  InputNumber,
  Radio,
  Segmented,
} from 'antd';
import type { FormInstance } from 'antd';
import type { RuleObject, RuleRender } from 'antd/es/form';
import { BAIFlex, BAIQuestionIconWithTooltip } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ServiceConfigurationFormItemsProps {
  namePrefix: Array<string | number>;
  /**
   * Start Command validation. The revision modal leaves the command optional
   * (`[{ whitespace: true }]`); the preset form requires it
   * (`[{ required: true }]`) since a preset is a reusable template.
   */
  commandRules?: (RuleObject | RuleRender)[];
  portRules?: (RuleObject | RuleRender)[];
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
// inside the Collapse. The two `*Rules` props stay caller-supplied since they
// encode each page's own business rules (required vs. optional command/port),
// not a capability check.
const ServiceConfigurationFormItems: React.FC<
  ServiceConfigurationFormItemsProps
> = ({
  namePrefix,
  commandRules = [{ whitespace: true }],
  portRules,
  placeholders,
}) => {
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
          // Basic/Advanced Segmented lives on the right of the header;
          // stopPropagation keeps switching modes from toggling the collapse.
          label: (
            <BAIFlex
              justify="between"
              align="center"
              gap="sm"
              style={{ flex: 1 }}
            >
              <span>{t('modelService.ServiceConfiguration')}</span>
              {supportsCommandShell && (
                <div onClick={(e) => e.stopPropagation()}>
                  <BAIFlex gap="xxs" align="center">
                    <Form.Item
                      name={[...namePrefix, 'advanced']}
                      noStyle
                      // Segmented uses 'basic' | 'advanced' strings; map
                      // to/from the boolean form value so submit and prefill
                      // keep the same semantics.
                      getValueProps={(checked: boolean) => ({
                        value: checked ? 'advanced' : 'basic',
                      })}
                      normalize={(mode: string) => mode === 'advanced'}
                    >
                      <Segmented
                        size="small"
                        options={[
                          { label: t('general.Basic'), value: 'basic' },
                          { label: t('general.Advanced'), value: 'advanced' },
                        ]}
                      />
                    </Form.Item>
                    <BAIQuestionIconWithTooltip
                      title={t('modelService.CommandAdvancedModeTooltip')}
                    />
                  </BAIFlex>
                </div>
              )}
            </BAIFlex>
          ),
          children: (
            <>
              {/* Basic/Advanced + Execution/Shell controls need the 26.8.0
                  command/shell API; on older managers only the plain command
                  input below is shown. */}
              {supportsCommandShell && (
                <Form.Item dependencies={[[...namePrefix, 'advanced']]} noStyle>
                  {({ getFieldValue: getAdv }: FormInstance) =>
                    getAdv([...namePrefix, 'advanced']) ? (
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
                    ) : null
                  }
                </Form.Item>
              )}
              {/* Command input: multi-line textarea in Shell mode (backend
                  runs `shell -c command`, so operators work); single-line
                  input in Exec mode (shell is null → command run directly as
                  argv, so operators do NOT work). Legacy (<26.8.0) managers
                  get a plain single-line input that is tokenized on submit. */}
              <Form.Item
                dependencies={[
                  [...namePrefix, 'advanced'],
                  [...namePrefix, 'execution'],
                ]}
                noStyle
              >
                {({ getFieldValue: getMode }: FormInstance) => {
                  const advanced = !!getMode([...namePrefix, 'advanced']);
                  const isExec =
                    advanced &&
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
                      // The hint states how the command will be run, so it
                      // follows that rather than the UI mode: Exec is the
                      // only case that does not go through a shell, and
                      // Basic runs under the backend's default shell exactly
                      // like Advanced + Shell. Managers without the
                      // command/shell path still receive a tokenized
                      // `startCommand`, so they keep the original
                      // shell-syntax hint (FR-3166).
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
                      // operators are valid argv content).
                      rules={commandRules}
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
                rules={portRules}
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
