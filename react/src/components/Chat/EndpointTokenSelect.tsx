import type {
  EndpointTokenSelectQuery,
  EndpointTokenSelectQuery$data,
} from './__generated__/EndpointTokenSelectQuery.graphql';
import { useControllableValue } from 'ahooks';
import { Input, Select } from 'antd';
import type { SelectProps } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import { castArray, sortBy } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

function sortEndpointTokenList(
  endpointTokenListData: EndpointTokenSelectQuery$data['endpoint_token_list'],
) {
  if (!endpointTokenListData.ok) return [];

  const now = dayjs();
  return sortBy(endpointTokenListData.value?.items, 'created_at').map(
    (item) => ({
      label: item?.token,
      value: item?.token,
      disabled: !dayjs(item?.valid_until).tz().isAfter(now),
    }),
  );
}

interface EndpointTokenSelectProps extends Omit<SelectProps, 'options'> {
  endpointId?: string | null;
}

const EndpointTokenSelect: React.FC<EndpointTokenSelectProps> = ({
  endpointId,
  ...props
}) => {
  const { t } = useTranslation();
  const [controllableValue, setControllableValue] =
    useControllableValue<string>(props);

  const { endpoint_token_list } = useLazyLoadQuery<EndpointTokenSelectQuery>(
    graphql`
      query EndpointTokenSelectQuery(
        $endpointId: UUID!
        $isEmptyEndpointId: Boolean!
      ) {
        endpoint_token_list(offset: 0, limit: 100, endpoint_id: $endpointId)
          @skipOnClient(if: $isEmptyEndpointId)
          @catch {
          items {
            id
            token
            created_at
            valid_until
          }
        }
      }
    `,
    {
      endpointId: endpointId || '',
      isEmptyEndpointId: !endpointId,
    },
  );

  const selectOptions = useMemo(
    () => sortEndpointTokenList(endpoint_token_list),
    [endpoint_token_list],
  );

  return selectOptions.length <= 0 ? (
    <Input onChange={(e) => setControllableValue(e.target.value)} />
  ) : (
    <Select
      placeholder={t('chatui.SelectToken')}
      style={{
        fontWeight: 'normal',
        width: '200px',
      }}
      options={selectOptions}
      value={controllableValue}
      onChange={(_, option) => {
        setControllableValue(castArray(option)?.[0].value ?? '');
      }}
      {...props}
    />
  );
};

export default EndpointTokenSelect;
