import { BAIStorageProxySelectQuery } from '../../__generated__/BAIStorageProxySelectQuery.graphql';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIMultiSelector, {
  type BAIMultiSelectorProps,
} from '../BAIMultiSelector';
import * as _ from 'lodash-es';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface BAIStorageProxySelectProps extends Omit<
  BAIMultiSelectorProps,
  'options'
> {}

// TODO(needs-backend, FR-3243): there is no dedicated storage-proxy list
// field; proxies are derived from the (offset-paginated) volume list. Swap
// this for a dedicated field once one exists. A real deployment's volume
// count is nowhere near this ceiling, so a single fixed-size fetch is enough
// to surface every distinct proxy in the meantime.
const VOLUME_FETCH_LIMIT = 1000;

const BAIStorageProxySelect = (selectProps: BAIStorageProxySelectProps) => {
  'use memo';
  const { t } = useBAIi18n();

  const { storage_volume_list } = useLazyLoadQuery<BAIStorageProxySelectQuery>(
    graphql`
      query BAIStorageProxySelectQuery($limit: Int!) {
        storage_volume_list(limit: $limit, offset: 0) {
          items {
            proxy
          }
        }
      }
    `,
    { limit: VOLUME_FETCH_LIMIT },
    {},
  );

  const proxies = _.uniq(
    _.compact(_.map(storage_volume_list?.items, (item) => item?.proxy)),
  );

  return (
    <BAIMultiSelector
      hasSearch
      options={_.map(proxies, (proxy) => ({ label: proxy, value: proxy }))}
      placeholder={t('comp:BAIStorageProxySelect.SelectStorageProxy')}
      {...selectProps}
    />
  );
};

export default BAIStorageProxySelect;
