/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import type { FormInstance } from '../../form-engine';
import { COMMAND_SHELL_OPTIONS } from '../../helper/modelServiceCommand';
import { useSuspendedBackendaiClient } from '../../hooks';
import {
  AstryxFormNumberInput,
  AstryxFormRadioList,
  AstryxFormTextArea,
  AstryxFormTextInput,
} from '../astryxFormControls';
import '../collapsible-section.css';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { useTheme } from '@astryxdesign/core/theme';
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
  /**
   * BA-7210 / FR-3481: appended below the base Port tooltip text when the
   * caller's manager supports inheriting an omitted port from the runtime
   * variant baseline. Only the preset page passes this (gated on
   * `preset-model-config-type`); the revision modal never inherits a port.
   */
  portTooltipExtra?: string;
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
> = ({ namePrefix, placeholders, portTooltipExtra }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
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
    <Collapsible
      className="bai-collapsible-section"
      defaultIsOpen
      trigger={t('modelService.ServiceConfiguration')}
    >
      {/* Execution/Shell controls need the 26.8.0 command/shell API;
          on older managers only the plain command input below is
          shown. */}
      {supportsCommandShell && (
        // The Collapsible supplies no gap between its trigger and content;
        // give the first row one explicitly.
        <BAIFlex
          gap="sm"
          align="start"
          style={{ marginTop: token('--spacing-3') }}
        >
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
          <Form.Item dependencies={[[...namePrefix, 'execution']]} noStyle>
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
                    placeholder={COMMAND_SHELL_OPTIONS.map((o) => o.value).join(
                      ', ',
                    )}
                    hasClear
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
        tooltip={
          portTooltipExtra ? (
            <span style={{ whiteSpace: 'pre-line' }}>
              {t('modelService.PortTooltip')}
              {'\n\n'}
              {portTooltipExtra}
            </span>
          ) : (
            t('modelService.PortTooltip')
          )
        }
        // antd's Collapse panel used to supply the section's bottom padding;
        // the flat Astryx Collapsible doesn't, so the last field keeps an
        // explicit gap before whatever section follows.
        style={{ marginBottom: token('--spacing-5') }}
      >
        {/* Backend `PresetModelServiceConfigInput.port` is `gt=1` exclusive,
            hence min 2. */}
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
