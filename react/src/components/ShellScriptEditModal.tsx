/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { ShellScriptType } from '../pages/UserSettingsPage';
import BAICodeEditor from './BAICodeEditor';
import { DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { App, Button, Dropdown, Form, Select, Space, Typography } from 'antd';
import {
  BAIModal,
  BAIModalProps,
  BAIFlex,
  useErrorMessageResolver,
  useBAILogger,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
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
  const { message, modal } = App.useApp();
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
            <Space.Compact>
              <Button
                type="default"
                danger
                onClick={() => {
                  modal.confirm({
                    title: t('dialog.title.LetsDouble-Check'),
                    content: t('dialog.ask.DoYouWantToDeleteSomething', {
                      name:
                        shellInfo === 'bootstrap'
                          ? t('session.launcher.BootstrapScriptDetail')
                          : rcfileNames,
                    }),
                    onOk: deleteScript,
                  });
                }}
              >
                <DeleteOutlined />
              </Button>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'reset',
                      label: t('button.Reset'),
                      onClick: () => {
                        modal.confirm({
                          title: t('dialog.title.LetsDouble-Check'),
                          content: t('dialog.ask.DoYouWantToResetChanges'),
                          onOk: () => {
                            setScript('');
                          },
                        });
                      },
                      danger: true,
                    },
                  ],
                }}
              >
                <Button type="default" danger icon={<DownOutlined />} />
              </Dropdown>
            </Space.Compact>
          </BAIFlex>
          <BAIFlex gap={'sm'}>
            <Button
              key="cancel"
              onClick={() => onRequestClose()}
              style={{ width: 'fit-content' }}
            >
              {t('button.Cancel')}
            </Button>
            <Space.Compact>
              <Button
                key="submit"
                type="primary"
                onClick={() => {
                  saveScript();
                }}
              >
                {t('button.SaveAndClose')}
              </Button>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'save',
                      label: t('button.SaveWithoutClose'),
                      onClick: () => saveScript({ closeAfter: false }),
                    },
                  ],
                }}
              >
                <Button type="primary" icon={<DownOutlined />} />
              </Dropdown>
            </Space.Compact>
          </BAIFlex>
        </BAIFlex>
      }
      destroyOnHidden
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap={'sm'}>
        {shellInfo === 'bootstrap' && (
          <Typography.Text>
            {t('userSettings.BootstrapScriptDescription')}
          </Typography.Text>
        )}
        {shellInfo === 'userconfig' && (
          <Form.Item
            style={{
              marginBottom: 0,
            }}
            label={t('userSettings.UserConfigScript')}
          >
            <Select
              defaultValue={'.bashrc'}
              onChange={(value) => {
                const selectedScript = _.find(userConfigScript, {
                  path: value,
                });
                setScript(selectedScript?.data || '');
                setRcfileNames(value);
              }}
              options={[
                { value: '.bashrc' },
                { value: '.zshrc' },
                { value: '.tmux.conf.local' },
                { value: '.vimrc' },
                { value: '.Renviron' },
              ]}
              style={{ width: '200px' }}
            />
          </Form.Item>
        )}
        <BAICodeEditor
          onChange={(value) => setScript(value)}
          language="sh"
          editable
          value={script}
        />
      </BAIFlex>
    </BAIModal>
  );
};

export default ShellScriptEditModal;
