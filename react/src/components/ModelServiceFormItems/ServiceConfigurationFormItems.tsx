/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import type { FormInstance } from '../../form-engine';
import { COMMAND_SHELL_OPTIONS } from '../../helper/modelServiceCommand';
import { useSuspendedBackendaiClient } from '../../hooks';
import { theme } from '../../theme-shim';
import {
  AstryxFormNumberInput,
  AstryxFormRadioList,
  AstryxFormSegmented,
  AstryxFormTextArea,
  AstryxFormTextInput,
} from '../astryxFormControls';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { BAIFlex, BAIQuestionIconWithTooltip } from 'backend.ai-ui';
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
// inside the Collapsible. Start Command and Port are both optional on both
// forms (BA-6613): the backend defaults `shell` to `/bin/bash` and the
// submit-mapping layer on each page falls back to a default port, so neither
// field needs a `required` rule here. Shell itself stays required + prefilled
// with the default whenever Advanced/Shell mode is active, below.
const ServiceConfigurationFormItems: React.FC<
  ServiceConfigurationFormItemsProps
> = ({ namePrefix, placeholders }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const supportsCommandShell = baiClient.supports(
    'model-service-command-string',
  );

  return (
    // PILOT-DECISION: antd `Collapse` (single bordered panel, size="small",
    // defaultActiveKey open, forceRender) → Astryx `Collapsible`. The boxed
    // panel chrome is dropped (Collapsible is a flat "ghost" trigger +
    // content — the design's default) and `defaultIsOpen` matches
    // `defaultActiveKey`. `forceRender` needs no equivalent: Collapsible
    // keeps its children MOUNTED while collapsed (CSS-hidden), so the
    // command fields stay registered and validate on submit (FR-3205).
    //
    // PILOT-DECISION: the Basic/Advanced Segmented moves from the antd
    // Collapse header into the top of the content — Astryx renders the whole
    // `trigger` inside a <button>, which cannot host interactive controls
    // (this also drops the stopPropagation dance the antd header needed).
    <Collapsible defaultIsOpen trigger={t('modelService.ServiceConfiguration')}>
      {/* Basic/Advanced toggle for the command config, gated on the 26.8.0
          command/shell API (FR-3205). The form engine dropped antd's
          `normalize`; the `getValueProps`/`getValueFromEvent` pair maps the
          Segmented's 'basic' | 'advanced' strings to/from the boolean form
          value so submit and prefill keep the same semantics. */}
      {supportsCommandShell && (
        <BAIFlex
          gap="xxs"
          align="center"
          justify="end"
          style={{ marginBottom: token.marginXS }}
        >
          <Form.Item
            name={[...namePrefix, 'advanced']}
            noStyle
            getValueProps={(checked: boolean) => ({
              value: checked ? 'advanced' : 'basic',
            })}
            getValueFromEvent={(mode: string) => mode === 'advanced'}
          >
            {/* antd `Segmented size="small"` → AstryxFormSegmented (no
                density axis). Aria-only group label; reuses an existing key
                (no new i18n keys). */}
            <AstryxFormSegmented
              label={t('modelService.ServiceConfiguration')}
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
      )}
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
                  {/* antd Radio.Group → AstryxFormRadioList. */}
                  <AstryxFormRadioList
                    label={t('modelService.Execution')}
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
                    getExec([...namePrefix, 'execution']) === 'exec' ? null : (
                      <Form.Item
                        name={[...namePrefix, 'shell']}
                        label={t('modelService.Shell')}
                        tooltip={t('modelService.ShellTooltip')}
                        style={{ flex: 1 }}
                        required
                        rules={[{ required: true, whitespace: true }]}
                      >
                        {/* PILOT-DECISION: antd `AutoComplete` →
                            `AstryxFormTextInput` (free-text AutoComplete
                            does NOT map to `Typeahead`, which commits
                            `T | null` and cannot keep a typed string). The
                            suggestion dropdown is dropped; the known shells
                            are surfaced in the placeholder instead.
                            `allowClear` → `hasClear`. */}
                        <AstryxFormTextInput
                          label={t('modelService.Shell')}
                          placeholder={COMMAND_SHELL_OPTIONS.map(
                            (o) => o.value,
                          ).join(', ')}
                          hasClear
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
            advanced && getMode([...namePrefix, 'execution']) === 'exec';
          // Exec splits the input into an argv vector, so label it
          // "Command (argv)" to distinguish it from a shell command.
          const commandLabel = isExec
            ? t('modelService.CommandArgvLabel')
            : supportsCommandShell
              ? t('modelService.Command')
              : t('modelService.StartCommand');
          return (
            <Form.Item
              name={[...namePrefix, 'startCommand']}
              label={commandLabel}
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
              // operators are valid argv content). Optional (BA-6613):
              // only guard against whitespace-only input.
              rules={[{ whitespace: true }]}
            >
              {!supportsCommandShell ? (
                // Legacy (<26.8.0): plain single-line input,
                // tokenized on submit.
                <AstryxFormTextInput
                  label={commandLabel}
                  placeholder={placeholders?.command}
                />
              ) : isExec ? (
                // Exec: argv example, no shell operators.
                <AstryxFormTextInput
                  label={commandLabel}
                  placeholder={placeholders?.command}
                />
              ) : (
                // PILOT-DECISION: antd `autoSize={{ minRows: 2 }}`
                // (grow-with-content) has no Astryx TextArea
                // equivalent — fixed `rows={2}` instead.
                <AstryxFormTextArea
                  label={commandLabel}
                  placeholder={placeholders?.command}
                  rows={2}
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
        <AstryxFormNumberInput
          label={t('modelService.Port')}
          min={2}
          max={65535}
          placeholder={placeholders?.port}
        />
      </Form.Item>
    </Collapsible>
  );
};

export default ServiceConfigurationFormItems;
