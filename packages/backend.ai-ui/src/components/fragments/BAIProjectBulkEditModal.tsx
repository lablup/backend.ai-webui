import { BAIProjectBulkEditModalFragment$key } from '../../__generated__/BAIProjectBulkEditModalFragment.graphql';
import { BAIProjectBulkEditModalProjectMutation } from '../../__generated__/BAIProjectBulkEditModalProjectMutation.graphql';
import { useMutationWithPromise } from '../../hooks';
import BAIAlert from '../BAIAlert';
import BAIFlex from '../BAIFlex';
import BAIModal, { BAIModalProps } from '../BAIModal';
import BAISelect from '../BAISelect';
import BAIProjectResourcePolicySelector from './BAIProjectResourcePolicySelector';
import { Form, theme } from 'antd';
import _ from 'lodash';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export interface BAIProjectBulkEditModalProps extends BAIModalProps {
  selectedProjectFragments: BAIProjectBulkEditModalFragment$key;
}

const BAIProjectBulkEditModal = ({
  selectedProjectFragments,
  ...tableProps
}: BAIProjectBulkEditModalProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
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
            const promises = _.chain(selectedProjects)
              .map((project) => project.row_id)
              .compact()
              .map((id) => {
                return mutateProjectWithPromise({
                  gid: id,
                  props: {
                    resource_policy: values.resource_policy,
                  },
                });
              })
              .value();

            return Promise.all(promises).then(() => tableProps.onOk?.(e));
          })
          .finally(() => setIsSaving(false));
      }}
      destroyOnHidden
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <BAIAlert
          type="info"
          showIcon
          ghostInfoBg={false}
          title={t(
            'comp:BAIProjectBulkEditModal.FollowingFoldersWillBeUpdated',
          )}
          description={
            <ul
              style={{
                margin: 0,
                padding: 0,
                paddingTop: token.paddingXXS,
                listStyle: 'circle',
              }}
            >
              {_.map(selectedProjects, (project) => (
                <li key={project.row_id}>{project.name}</li>
              ))}
            </ul>
          }
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
              <BAIProjectResourcePolicySelector />
            </Form.Item>
          </Suspense>
        </Form>
      </BAIFlex>
    </BAIModal>
  );
};

export default BAIProjectBulkEditModal;
