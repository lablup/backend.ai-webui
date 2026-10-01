/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import useConnectedBAIClient from '../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import type { BAIUserSelectScope } from './BAIUserSelect';

/**
 * The `BAIUserSelect` scope an admin page hands over: every user for a
 * super-admin, the caller's own domain for a domain admin.
 */
const useAdminUserSelectScope = (): BAIUserSelectScope => {
  'use memo';
  const baiClient = useConnectedBAIClient();
  return baiClient.is_superadmin
    ? { type: 'admin' }
    : { type: 'domain', domainName: baiClient._config.domainName };
};

export default useAdminUserSelectScope;
