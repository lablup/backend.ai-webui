import antdThemeJsonSchema from '../../../../resources/antdThemeConfig.schema.json';
import themeJsonSchema from '../../../../resources/theme.schema.json';
import { ExportOutlined, ImportOutlined } from '@ant-design/icons';
import { Editor as MonacoEditor, type Monaco } from '@monaco-editor/react';
import { Alert, App, Skeleton, theme, Upload } from 'antd';
import {
  BAIButton,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  useBAILogger,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { downloadBlob } from 'src/helper/csv-util';
import { useThemeMode } from 'src/hooks/useThemeMode';
import { useUserCustomThemeConfig } from 'src/hooks/useUserCustomThemeConfig';

interface ThemeJsonConfigModalProps extends BAIModalProps {
  onRequestClose: () => void;
}

const ThemeJsonConfigModal: React.FC<ThemeJsonConfigModalProps> = ({
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { isDarkMode } = useThemeMode();
  const { userCustomThemeConfig, setUserCustomThemeConfig } =
    useUserCustomThemeConfig();
  const { logger } = useBAILogger();

  const [editorValue, setEditorValue] = useState(
    JSON.stringify(userCustomThemeConfig ?? {}, null, 2) ?? '',
  );
  const monacoRef = useRef<Monaco | null>(null);

  return (
    <BAIModal
      title={t('theme.ThemeJsonConfiguration')}
      {...modalProps}
      onCancel={onRequestClose}
      width={800}
      footer={
        <BAIFlex direction="row" justify="between" gap="xs">
          <BAIFlex gap="sm">
            <Upload
              showUploadList={false}
              accept=".json,application/json"
              beforeUpload={async (file) => {
                // Separate error handling for file read errors vs JSON parse errors.
                // Schema validation errors are shown in the Monaco editor.
                let content: string;
                try {
                  content = await file.text();
                } catch (error) {
                  message.error(t('theme.FailedToReadFile'));
                  logger.error('Failed to read file', error);
                  return false;
                }

                try {
                  const parsed = JSON.parse(content);
                  setEditorValue(JSON.stringify(parsed, null, 2));
                } catch (error) {
                  // Invalid JSON format - still load content into editor for user to fix
                  setEditorValue(content);
                  message.error(t('theme.InvalidJsonFileAlert'));
                  logger.warn('Invalid JSON format in imported file', error);
                }
                return false;
              }}
            >
              <BAIButton icon={<ImportOutlined />}>
                {t('theme.button.ImportFromJson')}
              </BAIButton>
            </Upload>
            <BAIButton
              icon={<ExportOutlined />}
              action={async () => {
                const markers =
                  await monacoRef.current?.editor.getModelMarkers();
                if (_.isEmpty(userCustomThemeConfig)) {
                  message.error(t('userSettings.theme.NoChangesMade'));
                } else if (markers && markers.length > 0) {
                  message.error(t('theme.CannotApplyInvalidJsonConfig'));
                } else {
                  // should export current value not the userCustomThemeConfig state
                  const blob = new Blob(
                    [JSON.stringify(JSON.parse(editorValue), null, 2)],
                    { type: 'application/json' },
                  );
                  downloadBlob(blob, `theme.json`);
                }
              }}
            >
              {t('theme.button.ExportToJson')}
            </BAIButton>
          </BAIFlex>
          <BAIFlex gap="sm">
            <BAIButton onClick={onRequestClose}>{t('button.Cancel')}</BAIButton>
            <BAIButton
              type="primary"
              action={async () => {
                const markers =
                  await monacoRef.current?.editor.getModelMarkers();
                if (markers && markers.length > 0) {
                  message.error(t('theme.CannotApplyInvalidJsonConfig'));
                  return;
                }
                setUserCustomThemeConfig(JSON.parse(editorValue));
                message.success(t('theme.JsonConfigAppliedSuccessfully'));
                onRequestClose();
              }}
            >
              {t('button.OK')}
            </BAIButton>
          </BAIFlex>
        </BAIFlex>
      }
      styles={{
        body: {
          // set maximum height for monaco editor. It is same as BAIModal body maxHeight
          height: 'calc(100vh - 69px - 57px - 48px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      <Alert
        description={t('theme.ThemeJsonConfigurationDesc')}
        showIcon
        style={{ marginBottom: token.marginMD, flexShrink: 0 }}
      />
      <MonacoEditor
        language="json"
        height={'100%'}
        theme={isDarkMode ? 'vs-dark' : 'vs'}
        value={editorValue}
        onChange={(v) => setEditorValue(v ?? '')}
        options={{
          minimap: { enabled: false },
          fixedOverflowWidgets: true,
        }}
        loading={<Skeleton active style={{ height: '100%' }} />}
        beforeMount={(monaco) => {
          monacoRef.current = monaco;
          monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemaValidation: 'error',
            schemas: [
              {
                // Schema URIs must match Monaco's inmemory model path resolution for $ref to work
                uri: 'inmemory://model/theme.schema.json',
                fileMatch: ['*'],
                schema: themeJsonSchema,
              },
              {
                uri: 'inmemory://model/antdThemeConfig.schema.json',
                fileMatch: ['*'],
                schema: antdThemeJsonSchema,
              },
            ],
          });
        }}
      />
    </BAIModal>
  );
};

export default ThemeJsonConfigModal;
