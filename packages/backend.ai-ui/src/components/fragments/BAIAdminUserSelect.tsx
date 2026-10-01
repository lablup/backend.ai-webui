/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The user picker for admin pages: every user of the signed-in admin's domain
 (the WebUI assumes a single domain), through `scopedUsersV2`. Shares the
 option list, search and value handling with `BAIUserSelect`.
*/
import { BAIAdminUserSelectDomainIdQuery } from '../../__generated__/BAIAdminUserSelectDomainIdQuery.graphql';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIComplexSelect from '../BAIComplexSelect';
import useConnectedBAIClient from '../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import {
  type BAIUserSelectBaseProps,
  ScopedUserOptions,
} from './BAIUserSelect';
import { Suspense } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type BAIAdminUserSelectProps = BAIUserSelectBaseProps;

const DomainUserOptions: React.FC<BAIAdminUserSelectProps> = (props) => {
  'use memo';
  const baiClient = useConnectedBAIClient();
  const domainName: string = baiClient._config.domainName;
  // `UserScope.domain` takes the domain UUID; the client only knows its name.
  const { domainV2 } = useLazyLoadQuery<BAIAdminUserSelectDomainIdQuery>(
    graphql`
      query BAIAdminUserSelectDomainIdQuery($domainName: String!) {
        domainV2(domainName: $domainName) {
          entityId
        }
      }
    `,
    { domainName },
  );
  if (!domainV2) {
    throw new Error(`Domain not found: ${domainName}`);
  }
  return (
    <ScopedUserOptions
      userScope={{ domain: [{ value: domainV2.entityId }] }}
      {...props}
    />
  );
};

// Suspends here, not at the caller: inside a filter popover a page-level
// fallback would unmount the popover before the picker shows.
const BAIAdminUserSelect: React.FC<BAIAdminUserSelectProps> = (props) => {
  'use memo';
  const { t } = useBAIi18n();
  return (
    <Suspense
      fallback={
        <BAIComplexSelect
          label={props.label}
          isLabelHidden={props.isLabelHidden}
          width={props.width}
          placeholder={props.placeholder ?? t('comp:BAIUserSelect.SelectUser')}
          options={[]}
          isLoading
          isDisabled
        />
      }
    >
      <DomainUserOptions {...props} />
    </Suspense>
  );
};

export default BAIAdminUserSelect;
