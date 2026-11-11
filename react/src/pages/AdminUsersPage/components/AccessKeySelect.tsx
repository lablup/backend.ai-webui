/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AccessKeySelectQuery } from '../../../__generated__/AccessKeySelectQuery.graphql';
import { BAISelect, BAISelectProps } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface AccessKeySelectProps extends BAISelectProps {
  userId: string;
  fetchKey?: string;
}

const AccessKeySelect: React.FC<AccessKeySelectProps> = ({
  userId,
  fetchKey,
  ...selectProps
}) => {
  const { t } = useTranslation();

  // Only the user edit modal mounts this, and it is superadmin-only (ADR 0012).
  // TODO: Switch to infinite scroll; keypairs past the first 100 are not listed.
  const { adminKeypairsV2 } = useLazyLoadQuery<AccessKeySelectQuery>(
    graphql`
      query AccessKeySelectQuery($userId: UUID!) {
        adminKeypairsV2(filter: { userId: { equals: $userId } }, limit: 100) {
          edges {
            node {
              id
              accessKey
              isActive
            }
          }
        }
      }
    `,
    {
      userId,
    },
    {
      fetchPolicy: 'store-and-network',
      fetchKey: fetchKey,
    },
  );

  const options = _.map(adminKeypairsV2?.edges, ({ node: kp }) => ({
    value: kp.accessKey,
    label: kp.accessKey,
    disabled: kp.isActive
      ? false
      : { reason: t('credential.KeypairIsInactive') },
  }));

  return (
    <BAISelect
      placeholder={t('credential.SelectAccessKey')}
      options={options}
      {...selectProps}
    />
  );
};

export default AccessKeySelect;
