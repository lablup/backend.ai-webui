import { BAIProjectBulkEditModalFragment$key } from '../../__generated__/BAIProjectBulkEditModalFragment.graphql';
import { BAIProjectBulkEditModalProjectMutation } from '../../__generated__/BAIProjectBulkEditModalProjectMutation.graphql';
import { App } from '../../app-shim';
import { Form } from '../../form-engine';
import { useErrorMessageResolver, useMutationWithPromise } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIFlex from '../BAIFlex';
import BAIListAlert from '../BAIListAlert';
import BAIModal, { BAIModalProps } from '../BAIModal';
import BAISelect from '../BAISelect';
import BAIProjectResourcePolicySelect from './BAIProjectResourcePolicySelect';
import * as _ from 'lodash-es';
import { Suspense, useState } from 'react';
import { graphql, useFragment } from 'react-relay';

export interface BAIProjectBulkEditModalProps extends BAIModalProps {
  selectedProjectFragments: BAIProjectBulkEditModalFragment$key;
}

const BAIProjectBulkEditModal = ({
  selectedProjectFragments,
  ...tableProps
}: BAIProjectBulkEditModalProps) => {
  'use memo';
  const { t } = useBAIi18n();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const [form] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);
  const mutateProjectWithPromise =
    useMutationWithPromise<BAIProjectBulkEditModalProjectMutation>(graphql`
      mutation BAIProjectBulkEditModalProjectMutation(
        $input: PartialBulkUpdateProjectsInput!
      ) {
        partialBulkUpdateProjectsV2(input: $input) {
          successes {
            id
          }
          failed {
            id
            message
          }
        }
      }
    `);

  const selectedProjects = useFragment<BAIProjectBulkEditModalFragment$key>(
    graphql`
      fragment BAIProjectBulkEditModalFragment on GroupNode
      @relay(plural: true) {
        name
        row_id
      }
    `,
    selectedProjectFragments,
  );

  return (
    <BAIModal
      {...tableProps}
      confirmLoading={isSaving}
      title={t('comp:BAIProjectBulkEditModal.UpdateMultipleProjects')}
      okText={t('general.button.Save')}
      onOk={(e) => {
        setIsSaving(true);
        form
          .validateFields()
          .then((values) => {
            const ids = _.compact(
              _.map(selectedProjects, (project) => project.row_id),
            );
            return mutateProjectWithPromise({
              input: {
                items: _.map(ids, (id) => ({
                  id,
                  input: { resourcePolicy: values.resource_policy },
                })),
              },
            }).then(({ partialBulkUpdateProjectsV2: result }) => {
              if (_.isEmpty(result.failed)) {
                tableProps.onOk?.(e);
                return;
              }
              _.forEach(result.failed, (failure) => {
                const name = _.find(selectedProjects, {
                  row_id: failure.id,
                })?.name;
                message.error(
                  name ? `${name}: ${failure.message}` : failure.message,
                );
              });
            });
          })
          .catch((error) => {
            // `validateFields` rejects with `errorFields`; the form shows those.
            if (error?.errorFields) return;
            message.error(getErrorMessage(error));
          })
          .finally(() => setIsSaving(false));
      }}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <BAIListAlert
          type="info"
          showIcon
          ghostInfoBg={false}
          title={t(
            'comp:BAIProjectBulkEditModal.FollowingProjectsWillBeUpdated',
          )}
          items={_.map(selectedProjects, (project) => ({
            key: project.row_id,
            content: project.name,
          }))}
        />
        <Form form={form}>
          <Suspense
            fallback={
              <Form.Item
                label={t('comp:BAIProjectBulkEditModal.ProjectResourcePolicy')}
              >
                <BAISelect loading disabled />
              </Form.Item>
            }
          >
            <Form.Item
              label={t('comp:BAIProjectBulkEditModal.ProjectResourcePolicy')}
              name="resource_policy"
            >
              <BAIProjectResourcePolicySelect />
            </Form.Item>
          </Suspense>
        </Form>
      </BAIFlex>
    </BAIModal>
  );
};

export default BAIProjectBulkEditModal;
