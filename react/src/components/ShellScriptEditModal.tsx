import { useBaiSignedRequestWithPromise } from '../helper';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { ShellScriptType } from '../pages/UserSettingsPage';
import BAICodeEditor from './BAICodeEditor';
import { DeleteOutlined } from '@ant-design/icons';
import { App, Button, Dropdown, Form, Select, Typography } from 'antd';
import {
  BAIModal,
  BAIModalProps,
  BAIFlex,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useMemo, useState } from 'react';
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
  const { message, modal } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const [rcfileNames, setRcfileNames] = useState<string>('.bashrc');
  const [script, setScript] = useState<string>('');
  const [userConfigScript, setUserConfigScript] = useState<
    Array<UserConfigScript>
  >([]);
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const updateBootStrapScriptMutation = useTanMutation({
    mutationFn: (script: string) => {
      return baiRequestWithPromise({
        method: 'POST',
        url: '/user-config/bootstrap-script',
        body: { script },
      });
    },
  });
  const updateUserConfigScriptMutation = useTanMutation({
    mutationFn: (script: string) => {
      return baiRequestWithPromise({
        method: 'PATCH',
        url: '/user-config/dotfiles',
        body: {
          data: script,
          path: rcfileNames,
          permission: '644',
        },
      });
    },
  });
  const createUserConfigScriptMutation = useTanMutation({
    mutationFn: (script: string) => {
      return baiRequestWithPromise({
        method: 'POST',
        url: '/user-config/dotfiles',
        body: {
          path: rcfileNames,
          data: script,
          permission: '644',
        },
      });
    },
  });
  const deleteUserConfigScriptMutation = useTanMutation({
    mutationFn: () => {
      return baiRequestWithPromise({
        method: 'DELETE',
        url: '/user-config/dotfiles',
        body: {
          path: rcfileNames,
        },
      });
    },
  });

  const fetchScript = () => {
    if (shellInfo === 'bootstrap') {
      (
        baiRequestWithPromise({
          method: 'GET',
          url: '/user-config/bootstrap-script',
        }) as Promise<string>
      ).then((response: string) => {
        setScript(response);
      });
    }
    if (shellInfo === 'userconfig') {
      (
        baiRequestWithPromise({
          method: 'GET',
          url: '/user-config/dotfiles',
        }) as Promise<Array<UserConfigScript>>
      ).then((response) => {
        const defaultScript = _.find(response, { path: rcfileNames });
        setScript(defaultScript?.data || '');
        setUserConfigScript(response);
      });
    }
  };

  useMemo(() => {
    fetchScript();
    //eslint-disable-next-line
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
          console.error(error);
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
            console.error(error);
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
            console.error(error);
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
          console.error(error);
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
          console.error(error);
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
            <Dropdown.Button
              type="default"
              danger
              style={{ width: 'fit-content' }}
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
                          if (shellInfo === 'bootstrap') {
                            setScript('');
                          }
                          if (shellInfo === 'userconfig') {
                            setScript('');
                          }
                        },
                      });
                    },
                    danger: true,
                  },
                ],
              }}
              onClick={() => {
                modal.confirm({
                  title: t('dialog.title.LetsDouble-Check'),
                  content: t('dialog.ask.DoYouWantToDeleteSomething', {
                    name:
                      shellInfo === 'bootstrap'
                        ? 'Bootstrap script'
                        : `${rcfileNames}`,
                  }),
                  onOk: deleteScript,
                });
              }}
            >
              <DeleteOutlined />
            </Dropdown.Button>
          </BAIFlex>
          <BAIFlex gap={'sm'}>
            <Button
              key="cancel"
              onClick={() => onRequestClose()}
              style={{ width: 'fit-content' }}
            >
              {t('button.Cancel')}
            </Button>
            <Dropdown.Button
              key="submit"
              type="primary"
              onClick={() => {
                saveScript();
              }}
              style={{ width: 'fit-content' }}
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
              {t('button.SaveAndClose')}
            </Dropdown.Button>
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
          language="shell"
          editable
          value={script}
        />
      </BAIFlex>
    </BAIModal>
  );
};

export default ShellScriptEditModal;
