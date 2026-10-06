import { BAIEntityLabelSettingModalFragment$key } from '../../__generated__/BAIEntityLabelSettingModalFragment.graphql';
import { BAIEntityLabelSettingModalPurgeMutation } from '../../__generated__/BAIEntityLabelSettingModalPurgeMutation.graphql';
import { BAIEntityLabelSettingModalUpsertMutation } from '../../__generated__/BAIEntityLabelSettingModalUpsertMutation.graphql';
import { App } from '../../app-shim';
import { Form, type FormInstance } from '../../form-engine';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import type { BAILabelableEntityType } from '../../hooks/useLabelableEntityTypes';
import BAIBulkErrorModal from '../BAIBulkErrorModal';
import BAIFlex from '../BAIFlex';
import BAIModal, { type BAIModalProps } from '../BAIModal';
import BAIUnmountAfterClose from '../BAIUnmountAfterClose';
import { AstryxFormTextInput } from '../astryxFormControls';
import { formatEntityLabel } from './BAIEntityLabelTokens';
import { Button } from '@lablup/ui-common/Button';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Text } from '@lablup/ui-common/Text';
import { PlusIcon, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { graphql, useFragment, useMutation } from 'react-relay';

const LABEL_MAX_LENGTH = 255;

export interface BAIEntityLabelSettingModalTarget {
  /** The entity's UUID, not its Relay global id. */
  entityId: string;
  /** Shown in the failure list; falls back to `entityId`. */
  name?: string;
}

export interface BAIEntityLabelSettingModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel' | 'title' | 'children'
> {
  entityType: BAILabelableEntityType;
  targets: ReadonlyArray<BAIEntityLabelSettingModalTarget>;
  /** The labels the single target carries now. Ignored with several targets. */
  entityLabelsFrgmt?: BAIEntityLabelSettingModalFragment$key | null;
  /** `success` is true when any label may have changed. */
  onRequestClose: (success: boolean) => void;
}

interface LabelFormValues {
  labels: Array<{ key?: string; value?: string } | undefined>;
}

interface LabelFailure {
  key: string;
  target: string;
  label: string;
  error: string;
}

const BAIEntityLabelSettingModalContent = ({
  entityType,
  targets,
  entityLabelsFrgmt,
  onRequestClose,
  ...modalProps
}: BAIEntityLabelSettingModalProps) => {
  'use memo';
  const { t } = useBAIi18n();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<LabelFormValues>>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [failures, setFailures] = useState<LabelFailure[]>([]);

  const isBulk = targets.length > 1;

  const entityLabels = useFragment(
    graphql`
      fragment BAIEntityLabelSettingModalFragment on EntityLabelConnection {
        edges {
          node {
            fieldId
            key
            value
          }
        }
      }
    `,
    isBulk ? null : entityLabelsFrgmt,
  );
  const currentLabels = (entityLabels?.edges ?? []).map((edge) => edge.node);

  const [commitUpsert] = useMutation<BAIEntityLabelSettingModalUpsertMutation>(
    graphql`
      mutation BAIEntityLabelSettingModalUpsertMutation(
        $input: UpsertEntityLabelInput!
      ) {
        upsertEntityLabel(input: $input) {
          label {
            id
            key
            value
          }
        }
      }
    `,
  );
  const [commitPurge] = useMutation<BAIEntityLabelSettingModalPurgeMutation>(
    graphql`
      mutation BAIEntityLabelSettingModalPurgeMutation($id: ID!) {
        purgeEntityLabel(id: $id) {
          label {
            id
          }
        }
      }
    `,
  );

  const upsert = (entityId: string, key: string, value: string) =>
    new Promise<void>((resolve, reject) => {
      commitUpsert({
        variables: { input: { target: { entityType, entityId }, key, value } },
        onCompleted: (_res, errors) =>
          errors?.length ? reject(new Error(errors[0].message)) : resolve(),
        onError: reject,
      });
    });

  const purge = (labelId: string) =>
    new Promise<void>((resolve, reject) => {
      commitPurge({
        variables: { id: labelId },
        onCompleted: (_res, errors) =>
          errors?.length ? reject(new Error(errors[0].message)) : resolve(),
        onError: reject,
      });
    });

  const save = async (values: LabelFormValues) => {
    const rows = values.labels.flatMap((row) =>
      row?.key ? [{ key: row.key, value: row.value ?? '' }] : [],
    );
    const tasks: Array<{
      target: BAIEntityLabelSettingModalTarget;
      label: string;
      run: () => Promise<void>;
    }> = [];
    for (const target of targets) {
      for (const row of rows) {
        const unchanged = currentLabels.some(
          (label) => label.key === row.key && label.value === row.value,
        );
        if (isBulk || !unchanged) {
          tasks.push({
            target,
            label: formatEntityLabel(row),
            run: () => upsert(target.entityId, row.key, row.value),
          });
        }
      }
    }
    if (!isBulk) {
      for (const label of currentLabels) {
        if (!rows.some((row) => row.key === label.key)) {
          tasks.push({
            target: targets[0],
            label: formatEntityLabel(label),
            run: () => purge(label.fieldId),
          });
        }
      }
    }
    if (tasks.length === 0) {
      onRequestClose(false);
      return;
    }

    setIsSaving(true);
    // One request per label until the manager offers a bulk mutation.
    const results = await Promise.allSettled(tasks.map((task) => task.run()));
    setIsSaving(false);

    const failed = results.flatMap((result, index) =>
      result.status === 'rejected'
        ? [
            {
              key: String(index),
              target: tasks[index].target.name ?? tasks[index].target.entityId,
              label: tasks[index].label,
              error:
                result.reason instanceof Error
                  ? result.reason.message
                  : String(result.reason),
            },
          ]
        : [],
    );
    if (failed.length === 0) {
      message.success(t('comp:BAIEntityLabelSettingModal.LabelsSaved'));
      onRequestClose(true);
    } else {
      setFailures(failed);
    }
  };

  return (
    <>
      <BAIModal
        title={
          isBulk
            ? t('comp:BAIEntityLabelSettingModal.AddLabelsToItems', {
                count: targets.length,
              })
            : t('comp:BAIEntityLabelSettingModal.EditLabels')
        }
        {...modalProps}
        open={modalProps.open && failures.length === 0}
        okText={t('comp:BAIEntityLabelSettingModal.Save')}
        confirmLoading={isSaving}
        onOk={() => {
          formRef.current
            ?.validateFields()
            .then(save)
            .catch(() => {});
        }}
        onCancel={() => onRequestClose(false)}
      >
        <BAIFlex direction="column" align="stretch" gap="sm">
          {isBulk && (
            <Text color="secondary">
              {t('comp:BAIEntityLabelSettingModal.BulkDescription')}
            </Text>
          )}
          <Form<LabelFormValues>
            ref={formRef}
            layout="vertical"
            autoComplete="off"
            initialValues={{
              labels: isBulk
                ? [{}]
                : currentLabels.map(({ key, value }) => ({ key, value })),
            }}
          >
            <Form.List name="labels">
              {(fields, { add, remove }) => (
                <BAIFlex direction="column" gap="xs" align="stretch">
                  {fields.map(({ key, name, ...restField }) => (
                    <BAIFlex
                      key={key}
                      direction="row"
                      align="baseline"
                      gap="xs"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'key']}
                        style={{ marginBottom: 0, flex: 1 }}
                        rules={[
                          {
                            required: true,
                            message: t(
                              'comp:BAIEntityLabelSettingModal.KeyRequired',
                            ),
                          },
                          {
                            max: LABEL_MAX_LENGTH,
                            message: t(
                              'comp:BAIEntityLabelSettingModal.TooLong',
                              { max: LABEL_MAX_LENGTH },
                            ),
                          },
                          ({ getFieldValue }) => ({
                            validator(_rule, labelKey) {
                              const keys = (
                                getFieldValue(
                                  'labels',
                                ) as LabelFormValues['labels']
                              ).map((row) => row?.key);
                              return labelKey &&
                                keys.filter((k) => k === labelKey).length > 1
                                ? Promise.reject(
                                    t(
                                      'comp:BAIEntityLabelSettingModal.KeyMustBeUnique',
                                    ),
                                  )
                                : Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <AstryxFormTextInput
                          label={t('comp:BAIEntityLabelSettingModal.Key')}
                          placeholder={t('comp:BAIEntityLabelSettingModal.Key')}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'value']}
                        style={{ marginBottom: 0, flex: 1 }}
                        rules={[
                          {
                            required: true,
                            message: t(
                              'comp:BAIEntityLabelSettingModal.ValueRequired',
                            ),
                          },
                          {
                            max: LABEL_MAX_LENGTH,
                            message: t(
                              'comp:BAIEntityLabelSettingModal.TooLong',
                              { max: LABEL_MAX_LENGTH },
                            ),
                          },
                        ]}
                      >
                        <AstryxFormTextInput
                          label={t('comp:BAIEntityLabelSettingModal.Value')}
                          placeholder={t(
                            'comp:BAIEntityLabelSettingModal.Value',
                          )}
                        />
                      </Form.Item>
                      <IconButton
                        variant="ghost"
                        label={t('comp:BAIEntityLabelSettingModal.RemoveLabel')}
                        tooltip={t(
                          'comp:BAIEntityLabelSettingModal.RemoveLabel',
                        )}
                        icon={<Trash2 size="1em" />}
                        onClick={() => remove(name)}
                      />
                    </BAIFlex>
                  ))}
                  <Button
                    variant="secondary"
                    width="100%"
                    icon={<PlusIcon />}
                    label={t('comp:BAIEntityLabelSettingModal.AddLabel')}
                    onClick={() => add()}
                  />
                </BAIFlex>
              )}
            </Form.List>
          </Form>
        </BAIFlex>
      </BAIModal>
      <BAIBulkErrorModal<LabelFailure>
        open={failures.length > 0}
        title={t('comp:BAIEntityLabelSettingModal.SomeLabelsFailed', {
          count: failures.length,
        })}
        columns={[
          {
            key: 'target',
            dataIndex: 'target',
            title: t('comp:BAIEntityLabelSettingModal.Target'),
          },
          {
            key: 'label',
            dataIndex: 'label',
            title: t('comp:BAIEntityLabelSettingModal.Label'),
          },
          {
            key: 'error',
            dataIndex: 'error',
            title: t('comp:BAIEntityLabelSettingModal.Error'),
          },
        ]}
        dataSource={failures}
        onRequestClose={() => {
          setFailures([]);
          onRequestClose(true);
        }}
      />
    </>
  );
};

const BAIEntityLabelSettingModal = (props: BAIEntityLabelSettingModalProps) => (
  <BAIUnmountAfterClose>
    <BAIEntityLabelSettingModalContent {...props} />
  </BAIUnmountAfterClose>
);

export default BAIEntityLabelSettingModal;
