import { BAIImportFromHuggingFaceModalScanArtifactModelsMutation } from '../__generated__/BAIImportFromHuggingFaceModalScanArtifactModelsMutation.graphql';
import BAIFlex from './BAIFlex';
import BAIText from './BAIText';
import BAIUnmountAfterClose from './BAIUnmountAfterClose';
import { App, Form, Input, Modal, ModalProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation } from 'react-relay';

export interface BAIImportFromHuggingFaceModalProps
  extends Omit<ModalProps, 'onOk'> {
  onOk: (e: React.MouseEvent<HTMLElement>, artifactId: string) => void;
}

const BAIImportFromHuggingFaceModal = ({
  onOk,
  onCancel,
  ...modalProps
}: BAIImportFromHuggingFaceModalProps) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const [scanArtifactModels, isInflightScanArtifactModels] =
    useMutation<BAIImportFromHuggingFaceModalScanArtifactModelsMutation>(
      graphql`
        mutation BAIImportFromHuggingFaceModalScanArtifactModelsMutation(
          $input: ScanArtifactModelsInput!
        ) {
          scanArtifactModels(input: $input) {
            artifactRevision {
              count
              edges {
                node {
                  artifact {
                    id
                  }
                }
              }
            }
          }
        }
      `,
    );
  return (
    <BAIUnmountAfterClose>
      <Modal
        title={t('comp:BAIImportFromHuggingFaceModal.ModalTitle')}
        okText={t('comp:BAIImportFromHuggingFaceModal.Import')}
        centered
        cancelText={t('general.button.Close')}
        {...modalProps}
        okButtonProps={{
          loading: isInflightScanArtifactModels,
          disabled: isInflightScanArtifactModels,
        }}
        onOk={(e) => {
          form
            .validateFields()
            .then((values) => {
              scanArtifactModels({
                variables: {
                  input: {
                    models: [
                      {
                        modelId: values.modelId,
                        revision: values.revision ?? null,
                      },
                    ],
                  },
                },
                onCompleted: (res, errors) => {
                  if (errors && errors.length > 0) {
                    errors.forEach((err) =>
                      message.error(
                        err.message ??
                          t(
                            'comp:BAIImportFromHuggingFaceModal.Failed to import model from hugging face',
                          ),
                      ),
                    );
                    return;
                  }
                  message.success(
                    t(
                      'comp:BAIImportFromHuggingFaceModal.SuccessfullyImportedModelFromHuggingFace',
                    ),
                  );
                  onOk(
                    e,
                    res.scanArtifactModels.artifactRevision.edges[0].node
                      .artifact.id,
                  );
                },
                onError: (error) => {
                  message.error(
                    error.message ??
                      t(
                        'comp:BAIImportFromHuggingFaceModal.Failed to import model from hugging face',
                      ),
                  );
                },
              });
            })
            .catch(() => {});
        }}
        onCancel={(e) => {
          onCancel?.(e);
        }}
        afterClose={() => {
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <BAIFlex direction="column" gap="md" align="stretch">
            <BAIText>
              {t('comp:BAIImportFromHuggingFaceModal.ModalDescription')}
            </BAIText>
            <Form.Item
              label={t('comp:BAIImportFromHuggingFaceModal.ModelID')}
              name="modelId"
              required
              rules={[{ required: true }]}
              style={{
                marginBottom: 0,
              }}
            >
              <Input
                placeholder={t(
                  'comp:BAIImportFromHuggingFaceModal.EnterAModelID',
                )}
              />
            </Form.Item>
            <Form.Item
              label={t('comp:BAIImportFromHuggingFaceModal.Version')}
              name="revision"
            >
              <Input
                placeholder={t(
                  'comp:BAIImportFromHuggingFaceModal.EnterAVersion',
                )}
              />
            </Form.Item>
          </BAIFlex>
        </Form>
      </Modal>
    </BAIUnmountAfterClose>
  );
};

export default BAIImportFromHuggingFaceModal;
