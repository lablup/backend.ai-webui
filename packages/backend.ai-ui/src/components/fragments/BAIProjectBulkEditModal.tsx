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

/** One project the bulk update did not apply to. `id` is the `GroupNode` id. */
export interface BAIProjectBulkEditFailure {
  id: string;
  name: string;
  message: string;
}

/** Per-project outcome of one save; ids are `GroupNode` ids. */
export interface BAIProjectBulkEditResult {
  succeededIds: string[];
  failures: BAIProjectBulkEditFailure[];
}

export interface BAIProjectBulkEditModalProps extends Omit<
  BAIModalProps,
  'onOk'
> {
  selectedProjectFragments: BAIProjectBulkEditModalFragment$key;
  /** Called once the request settles; a rejected request fails every project. */
  onCompleted?: (result: BAIProjectBulkEditResult) => void;
}

const BAIProjectBulkEditModal = ({
  selectedProjectFragments,
  onCompleted,
  ...modalProps
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
            entityId
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
        id
        name
        row_id
      }
    `,
    selectedProjectFragments,
  );

  return (
    <BAIModal
      {...modalProps}
      confirmLoading={isSaving}
      title={t('comp:BAIProjectBulkEditModal.UpdateMultipleProjects')}
      okText={t('general.button.Save')}
      onOk={() => {
        setIsSaving(true);
        form
          .validateFields()
          .then((values) => {
            const targets = _.filter(selectedProjects, (project) =>
              Boolean(project.row_id),
            );
            const byRowId = _.keyBy(targets, 'row_id');
            return mutateProjectWithPromise({
              input: {
                items: _.map(targets, (project) => ({
                  id: project.row_id as string,
                  input: { resourcePolicy: values.resource_policy },
                })),
              },
            }).then(
              ({ partialBulkUpdateProjectsV2: result }) => {
                onCompleted?.({
                  succeededIds: _.compact(
                    _.map(
                      result.successes,
                      (project) => byRowId[project.entityId]?.id,
                    ),
                  ),
                  failures: _.map(result.failed, (failure) => ({
                    id: byRowId[failure.id]?.id ?? failure.id,
                    name: byRowId[failure.id]?.name ?? failure.id,
                    message: failure.message,
                  })),
                });
              },
              (error) => {
                const reason = getErrorMessage(error);
                onCompleted?.({
                  succeededIds: [],
                  failures: _.map(targets, (project) => ({
                    id: project.id,
                    name: project.name ?? project.id,
                    message: reason,
                  })),
                });
              },
            );
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
