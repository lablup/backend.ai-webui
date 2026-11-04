/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import { MyResourcesInResourceGroup } from './DashboardPanels/memberCards/MyResourcesPanel';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIBoardItemTitle,
  BAIFlex,
  BAIFlexProps,
  ResourceStatistics,
  BAIFetchKeyButton,
  BAISkeleton,
  useFetchKey,
  useIsInBAIBoardItem,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { ReactNode, Suspense, useTransition } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Trans, useTranslation } from 'react-i18next';

interface MyResourceProps extends BAIFlexProps {
  fetchKey?: string;
  refetching?: boolean;
  /** Hides the card's own refresh button, for hosts that refresh it themselves. */
  hideRefreshButton?: boolean;
  extra?: ReactNode;
}

const MyResource: React.FC<MyResourceProps> = ({
  fetchKey,
  refetching,
  hideRefreshButton,
  extra,
  ...props
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const isInBoard = useIsInBAIBoardItem();
  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();

  const [internalFetchKey, updateInternalFetchKey] = useFetchKey();
  const [isPending, startTransition] = useTransition();

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        // On a board the board pads the item.
        ...(isInBoard
          ? {}
          : {
              paddingInline: token('--spacing-8'),
              paddingBottom: token('--spacing-4'),
            }),
        ...props.style,
      }}
      {..._.omit(props, ['style'])}
    >
      <BAIBoardItemTitle
        title={t('webui.menu.MyResources')}
        tooltip={<Trans i18nKey={'webui.menu.MyResourcesDescription'} />}
        extra={
          <BAIFlex gap={'xs'}>
            <BAIFetchKeyButton
              hidden={hideRefreshButton}
              size="small"
              loading={isPending || refetching}
              value=""
              onChange={() => {
                startTransition(() => {
                  updateInternalFetchKey();
                });
              }}
              variant="link"
              color="default"
            />
            {extra}
          </BAIFlex>
        }
      />
      {/* A transport failure, or a manager without myUserResourceAllocationV2, escapes @catch; keep the title and let refresh retry. */}
      <ErrorBoundary
        resetKeys={[
          fetchKey,
          internalFetchKey,
          currentProject.id,
          currentResourceGroup,
        ]}
        fallbackRender={() => (
          <ResourceStatistics
            resourceData={NO_RESOURCE_DATA}
            displayType="used"
            progressMode="normal"
          />
        )}
      >
        <Suspense fallback={<BAISkeleton />}>
          <MyResourceStatistics fetchKey={`${fetchKey}${internalFetchKey}`} />
        </Suspense>
      </ErrorBoundary>
    </BAIFlex>
  );
};

const NO_RESOURCE_DATA = { cpu: null, memory: null, accelerators: [] };

const MyResourceStatistics: React.FC<{ fetchKey: string }> = ({ fetchKey }) => {
  'use memo';
  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  if (!currentProject.id) {
    throw new Error('Project id is required for MyResource');
  }
  if (!currentResourceGroup) {
    return (
      <ResourceStatistics
        resourceData={NO_RESOURCE_DATA}
        displayType="used"
        progressMode="normal"
      />
    );
  }

  return (
    <MyResourcesInResourceGroup
      projectId={currentProject.id}
      resourceGroupName={currentResourceGroup}
      fetchKey={fetchKey}
    />
  );
};

export default MyResource;
