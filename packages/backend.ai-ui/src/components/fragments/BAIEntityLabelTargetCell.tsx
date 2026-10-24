import { BAIEntityLabelTargetCellQuery } from '../../__generated__/BAIEntityLabelTargetCellQuery.graphql';
import type { BAILabelableEntityType } from '../../hooks/useLabelableEntityTypes';
import BAISkeleton from '../BAISkeleton';
import BAIEntityLabelCell, {
  type BAIEntityLabelCellProps,
} from './BAIEntityLabelCell';
import BAIEntityLabelSettingModal from './BAIEntityLabelSettingModal';
import { Suspense, useState, useTransition } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface BAIEntityLabelTargetCellProps extends Pick<
  BAIEntityLabelCellProps,
  'editDisabledReason' | 'onLabelClick'
> {
  entityType: BAILabelableEntityType;
  /** The entity's UUID (`entityId`), not its Relay global id. */
  entityId: string;
  /** Names the entity in the editor's failure list; falls back to `entityId`. */
  name?: string;
  /** Shows the labels without the "Edit labels" action. */
  readOnly?: boolean;
}

const BAIEntityLabelTargetCellContent = ({
  entityType,
  entityId,
  name,
  readOnly = false,
  editDisabledReason,
  onLabelClick,
}: BAIEntityLabelTargetCellProps) => {
  'use memo';
  const [fetchKey, setFetchKey] = useState(0);
  const [, startRefreshTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { entityLabels } = useLazyLoadQuery<BAIEntityLabelTargetCellQuery>(
    graphql`
      query BAIEntityLabelTargetCellQuery($scope: [EntityTarget!]!) {
        entityLabels(scope: $scope, limit: 100) {
          ...BAIEntityLabelTokensFragment
          ...BAIEntityLabelSettingModalFragment
        }
      }
    `,
    { scope: [{ entityType, entityId }] },
    { fetchKey, fetchPolicy: 'store-and-network' },
  );

  return (
    <>
      <BAIEntityLabelCell
        entityLabelsFrgmt={entityLabels}
        onEdit={readOnly ? undefined : () => setIsModalOpen(true)}
        editDisabledReason={editDisabledReason}
        onLabelClick={onLabelClick}
      />
      {!readOnly && (
        <BAIEntityLabelSettingModal
          open={isModalOpen}
          entityType={entityType}
          targets={[{ entityId, name }]}
          entityLabelsFrgmt={entityLabels}
          onRequestClose={(success) => {
            setIsModalOpen(false);
            if (success) {
              startRefreshTransition(() => {
                setFetchKey((key) => key + 1);
              });
            }
          }}
        />
      )}
    </>
  );
};

/**
 * A Labels row for a detail surface whose entity type carries no `entityLabels`
 * field: loads the labels by entity target and refreshes them after an edit.
 */
const BAIEntityLabelTargetCell = (props: BAIEntityLabelTargetCellProps) => (
  <ErrorBoundary fallback={<>-</>}>
    <Suspense fallback={<BAISkeleton variant="input" size="small" />}>
      <BAIEntityLabelTargetCellContent {...props} />
    </Suspense>
  </ErrorBoundary>
);

export default BAIEntityLabelTargetCell;
