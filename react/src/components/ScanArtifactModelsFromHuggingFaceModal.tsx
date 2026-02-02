import { App, Form, type FormInstance, Input, theme } from 'antd';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAIText,
  useBAILogger,
} from 'backend.ai-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation } from 'react-relay';
import { ScanArtifactModelsFromHuggingFaceModalMutation } from 'src/__generated__/ScanArtifactModelsFromHuggingFaceModalMutation.graphql';

export interface ScanArtifactModelsFromHuggingFaceModalProps
  extends BAIModalProps {
  onRequestClose?: (
    e: React.MouseEvent<HTMLElement>,
    artifactId: string,
  ) => void;
}

type ScanArtifactModelsFromHuggingFaceModalInput = {
  modelId: string;
  revision?: string;
};

const ScanArtifactModelsFromHuggingFaceModal = ({
  onRequestClose,
  ...modalProps
}: ScanArtifactModelsFromHuggingFaceModalProps) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { logger } = useBAILogger();
  const formRef =
    useRef<FormInstance<ScanArtifactModelsFromHuggingFaceModalInput>>(null);
  const { message } = App.useApp();

  const [scanArtifactModels, isInflightScanArtifactModels] =
    useMutation<ScanArtifactModelsFromHuggingFaceModalMutation>(graphql`
      mutation ScanArtifactModelsFromHuggingFaceModalMutation(
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
    `);

  return (
    <>
      <BAIModal
        title={t('scanArtifactModelsFromHuggingFaceModal.ScanFromHuggingFace')}
        okText={t('scanArtifactModelsFromHuggingFaceModal.Scan')}
        centered
        cancelText={t('button.Close')}
        destroyOnHidden
        {...modalProps}
        okButtonProps={{
          loading: isInflightScanArtifactModels,
          disabled: isInflightScanArtifactModels,
        }}
        onOk={(e) => {
          formRef.current
            ?.validateFields()
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
                            'scanArtifactModelsFromHuggingFaceModal.FailedToScanModelFromHuggingFace',
                          ),
                      ),
                    );
                    return;
                  }
                  const artifactEdges =
                    res.scanArtifactModels.artifactRevision?.edges ?? [];
                  const artifactId =
                    artifactEdges[0]?.node?.artifact?.id ?? null;
                  if (!artifactId) {
                    message.error(
                      t(
                        'scanArtifactModelsFromHuggingFaceModal.FailedToScanModelFromHuggingFace',
                      ),
                    );
                    return;
                  }
                  message.success(
                    t(
                      'scanArtifactModelsFromHuggingFaceModal.SuccessfullyScannedModel',
                    ),
                  );
                  onRequestClose?.(e, artifactId);
                },
                onError: (error) => {
                  message.error(
                    error.message ??
                      t(
                        'scanArtifactModelsFromHuggingFaceModal.FailedToScanModelFromHuggingFace',
                      ),
                  );
                },
              });
            })
            .catch((err) => {
              logger.error(err);
            });
        }}
        afterClose={() => {
          formRef.current?.resetFields();
        }}
      >
        <Form ref={formRef} layout="vertical" preserve={false}>
          <BAIFlex direction="column" align="stretch">
            <BAIText style={{ marginBottom: token.marginMD }}>
              {t('scanArtifactModelsFromHuggingFaceModal.ModalDescription')}
            </BAIText>
            <Form.Item
              label={t('scanArtifactModelsFromHuggingFaceModal.ModelID')}
              name="modelId"
              required
              rules={[{ required: true }]}
            >
              <Input
                placeholder={t(
                  'scanArtifactModelsFromHuggingFaceModal.EnterAModelID',
                )}
              />
            </Form.Item>
            <Form.Item
              label={t('scanArtifactModelsFromHuggingFaceModal.Version')}
              name="revision"
            >
              <Input
                placeholder={t(
                  'scanArtifactModelsFromHuggingFaceModal.EnterAVersion',
                )}
              />
            </Form.Item>
          </BAIFlex>
        </Form>
      </BAIModal>
    </>
  );
};

export default ScanArtifactModelsFromHuggingFaceModal;
