/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { ShellScriptType } from '../pages/UserSettingsPage';
import BAICodeEditor from './BAICodeEditor';
import BAIFormItem from './BAIFormItem';
import { Button } from '@astryxdesign/core/Button';
import { ButtonGroup } from '@astryxdesign/core/ButtonGroup';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Selector } from '@astryxdesign/core/Selector';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIPopconfirmAstryx,
  BAIModal,
  BAIModalProps,
  BAIFlex,
  BAIDeleteConfirmModal,
  useErrorMessageResolver,
  useBAILogger,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Trash2, ChevronDown } from 'lucide-react';
import { useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

type UserConfigScript = {
  path: string;
  permission: string;
  data: string;
};

interface BootstrapScriptEditModalProps extends BAIModalProps {
  onRequestClose: (success?: boolean) => void;
  shellInfo: ShellScriptType;
}

const ShellScriptEditModal: React.FC<BootstrapScriptEditModalProps> = ({
  onRequestClose,
  shellInfo,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { logger } = useBAILogger();
  const { message } = App.useApp();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { getErrorMessage } = useErrorMessageResolver();
  const [rcfileNames, setRcfileNames] = useState<string>('.bashrc');
  const [script, setScript] = useState<string>('');
  const [userConfigScript, setUserConfigScript] = useState<
    Array<UserConfigScript>
  >([]);
  const baiClient = useSuspendedBackendaiClient();
  const updateBootStrapScriptMutation = useTanMutation({
    mutationFn: (script: string) => {
      return baiClient.userConfig.update_bootstrap_script(script);
    },
  });
  const updateUserConfigScriptMutation = useTanMutation({
    mutationFn: (script: string) => {
      return baiClient.userConfig.update(script, rcfileNames);
    },
  });
  const createUserConfigScriptMutation = useTanMutation({
    mutationFn: (script: string) => {
      return baiClient.userConfig.create(script, rcfileNames);
    },
  });
  const deleteUserConfigScriptMutation = useTanMutation({
    mutationFn: () => {
      return baiClient.userConfig.delete(rcfileNames);
    },
  });

  const fetchScript = () => {
    if (shellInfo === 'bootstrap') {
      baiClient.userConfig
        .get_bootstrap_script()
        .then((response: string | { script: string } | null) => {
          if (typeof response === 'string') {
            setScript(response);
          } else if (response?.script && typeof response.script === 'string') {
            setScript(response.script);
          } else {
            setScript('');
          }
        });
    }
    if (shellInfo === 'userconfig') {
      baiClient.userConfig.get().then((response: Array<UserConfigScript>) => {
        const defaultScript = _.find(response, { path: rcfileNames });
        setScript(defaultScript?.data || '');
        setUserConfigScript(response);
      });
    }
  };

  const fetchScriptEffectEvent = useEffectEvent(fetchScript);
  useEffect(() => {
    fetchScriptEffectEvent();
  }, [shellInfo]);

  const saveScript = ({ closeAfter = true } = {}) => {
    if (shellInfo === 'bootstrap') {
      if (!script) {
        message.error(t('userSettings.BootstrapScriptEmpty'));
        return;
      }
      updateBootStrapScriptMutation.mutate(script, {
        onSuccess: () => {
          message.success(t('userSettings.BootstrapScriptUpdated'));
          closeAfter && onRequestClose();
        },
        onError: (error) => {
          message.error(getErrorMessage(error));
          logger.error(error);
        },
      });
    }

    if (shellInfo === 'userconfig') {
      const existValidator = _.find(userConfigScript, { path: rcfileNames });
      if (existValidator) {
        updateUserConfigScriptMutation.mutate(script, {
          onSuccess: () => {
            message.success(t('userSettings.DescScriptUpdated'));
            if (closeAfter) {
              onRequestClose();
            } else {
              fetchScript();
            }
          },
          onError: (error) => {
            message.error(getErrorMessage(error));
            logger.error(error);
          },
        });
      } else {
        createUserConfigScriptMutation.mutate(script, {
          onSuccess: () => {
            message.success(t('userSettings.DescScriptCreated'));
            if (closeAfter) {
              onRequestClose();
            } else {
              fetchScript();
            }
          },
          onError: (error) => {
            message.error(getErrorMessage(error));
            logger.error(error);
          },
        });
      }
    }
  };

  const deleteScript = () => {
    if (shellInfo === 'bootstrap') {
      updateBootStrapScriptMutation.mutate('', {
        onSuccess: () => {
          message.success(t('userSettings.BootstrapScriptDeleted'));
          onRequestClose();
        },
        onError: (error) => {
          message.error(getErrorMessage(error));
          logger.error(error);
        },
      });
    }
    if (shellInfo === 'userconfig') {
      deleteUserConfigScriptMutation.mutate(undefined, {
        onSuccess: () => {
          message.success(
            `${t('userSettings.DescScriptDeleted')}${rcfileNames}`,
          );
          onRequestClose();
        },
        onError: (error) => {
          message.error(getErrorMessage(error));
          logger.error(error);
        },
      });
    }
  };

  return (
    <BAIModal
      width={800}
      title={
        shellInfo === 'bootstrap'
          ? t('userSettings.EditBootstrapScript')
          : t('userSettings.EditUserConfigScript')
      }
      onCancel={() => onRequestClose()}
      okText={t('button.Save')}
      footer={
        <BAIFlex justify="between" style={{ width: '100%' }}>
          <BAIFlex>
            <ButtonGroup label={t('button.Reset')}>
              <IconButton
                icon={<Trash2 size="1em" />}
                label={t('button.Delete')}
                tooltip={t('button.Delete')}
                variant="destructive"
                onClick={() => {
                  setIsDeleteConfirmOpen(true);
                }}
              />
              {/* PILOT-DECISION: antd's `Popconfirm` wrapping a single-item
                  `Dropdown` (menu -> confirm, both anchored to one chevron
                  trigger) collapses into one confirm popover directly on the
                  chevron — a one-item menu behind a confirm dialog is pure
                  indirection (simplicity policy, same precedent as
                  SettingItem.tsx's Reset control). */}
              <BAIPopconfirmAstryx
                title={t('dialog.title.LetsDouble-Check')}
                description={t('dialog.ask.DoYouWantToResetChanges')}
                isDanger
                onConfirm={() => {
                  setScript('');
                }}
              >
                <IconButton
                  icon={<ChevronDown size="1em" />}
                  label={t('button.Reset')}
                  tooltip={t('button.Reset')}
                  variant="destructive"
                />
              </BAIPopconfirmAstryx>
            </ButtonGroup>
          </BAIFlex>
          <BAIFlex gap={'sm'}>
            <Button
              key="cancel"
              variant="secondary"
              label={t('button.Cancel')}
              onClick={() => onRequestClose()}
              width="fit-content"
            />
            <ButtonGroup label={t('button.SaveAndClose')}>
              <Button
                key="submit"
                variant="primary"
                label={t('button.SaveAndClose')}
                onClick={() => {
                  saveScript();
                }}
              />
              <DropdownMenu
                button={{
                  icon: <ChevronDown size="1em" />,
                  isIconOnly: true,
                  label: t('button.MoreSaveOptions', 'More save options'),
                  variant: 'primary',
                }}
                hasChevron={false}
                items={[
                  {
                    label: t('button.SaveWithoutClose'),
                    onClick: () => saveScript({ closeAfter: false }),
                  },
                ]}
              />
            </ButtonGroup>
          </BAIFlex>
        </BAIFlex>
      }
      destroyOnHidden
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap={'sm'}>
        {shellInfo === 'bootstrap' && (
          <Text>{t('userSettings.BootstrapScriptDescription')}</Text>
        )}
        {shellInfo === 'userconfig' && (
          // Not a bound Form field (no `name` — the antd original didn't
          // give it one either, driving `rcfileNames`/`script` state by
          // hand); `BAIFormItem` here is purely the label layout.
          <BAIFormItem
            style={{
              marginBottom: 0,
            }}
            label={t('userSettings.UserConfigScript')}
          >
            <Selector
              label={t('userSettings.UserConfigScript')}
              isLabelHidden
              value={rcfileNames}
              options={[
                '.bashrc',
                '.zshrc',
                '.tmux.conf.local',
                '.vimrc',
                '.Renviron',
              ]}
              onChange={(value) => {
                const selectedScript = _.find(userConfigScript, {
                  path: value,
                });
                setScript(selectedScript?.data || '');
                setRcfileNames(value);
              }}
              width={200}
            />
          </BAIFormItem>
        )}
        <BAICodeEditor
          onChange={(value) => setScript(value)}
          language="sh"
          editable
          value={script}
        />
      </BAIFlex>
      <BAIDeleteConfirmModal
        open={isDeleteConfirmOpen}
        title={t('dialog.title.LetsDouble-Check')}
        target={t('general.ShellScript')}
        items={[
          {
            key: shellInfo ?? '',
            label: shellInfo === 'bootstrap' ? t('button.Delete') : rcfileNames,
          },
        ]}
        confirmText={
          shellInfo === 'bootstrap' ? t('button.Delete') : rcfileNames
        }
        requireConfirmInput
        inputProps={{
          placeholder:
            shellInfo === 'bootstrap' ? t('button.Delete') : rcfileNames,
        }}
        onOk={() => {
          setIsDeleteConfirmOpen(false);
          deleteScript();
        }}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </BAIModal>
  );
};

export default ShellScriptEditModal;
