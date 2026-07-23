import { BAIProjectBulkEditModalFragment$key } from '../../__generated__/BAIProjectBulkEditModalFragment.graphql';
import { BAIProjectBulkEditModalProjectMutation } from '../../__generated__/BAIProjectBulkEditModalProjectMutation.graphql';
import { useMutationWithPromise } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIFlex from '../BAIFlex';
import BAIListAlert from '../BAIListAlert';
import BAIModal, { BAIModalProps } from '../BAIModal';
import BAISelect from '../BAISelect';
import BAIProjectResourcePolicySelect from './BAIProjectResourcePolicySelect';
import { Form } from 'antd';
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
  const { t } = useBAIi18n();
  const [form] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);
  const mutateProjectWithPromise =
    useMutationWithPromise<BAIProjectBulkEditModalProjectMutation>(graphql`
      mutation BAIProjectBulkEditModalProjectMutation(
        $gid: UUID!
        $props: ModifyGroupInput!
      ) {
        modify_group(gid: $gid, props: $props) {
          ok
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
            const promises = _.map(
              _.compact(_.map(selectedProjects, (project) => project.row_id)),
              (id) => {
                return mutateProjectWithPromise({
                  gid: id,
                  props: {
                    resource_policy: values.resource_policy,
                  },
                });
              },
            );

            return Promise.all(promises).then(() => tableProps.onOk?.(e));
          })
          .finally(() => setIsSaving(false));
      }}
      destroyOnHidden
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
                <BAISelect loading />
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
