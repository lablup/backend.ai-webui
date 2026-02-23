/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  EndpointTokenSelectQuery,
  EndpointTokenSelectQuery$data,
} from '../../__generated__/EndpointTokenSelectQuery.graphql';
import { useControllableValue } from 'ahooks';
import { Input, Select } from 'antd';
import type { SelectProps } from 'antd';
import dayjs from 'dayjs';
import { castArray, sortBy } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

function sortEndpointTokenList(
  endpointTokenListData: EndpointTokenSelectQuery$data['endpoint_token_list'],
) {
  if (!endpointTokenListData.ok) return [];

  const now = dayjs();
  return sortBy(endpointTokenListData.value?.items, 'created_at').map(
    (item) => ({
      label: item?.token,
      value: item?.token,
      // FIXME: temporally parse UTC and change to timezone (timezone need to be added in server side)
      disabled: !dayjs.utc(item?.valid_until).tz().isAfter(now),
    }),
  );
}

interface EndpointTokenSelectProps extends Omit<SelectProps, 'options'> {
  endpointId?: string | null;
}

const EndpointTokenSelectWithQuery: React.FC<
  EndpointTokenSelectProps & {
    endpointId: string;
  }
> = ({ endpointId, ...props }) => {
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
      endpointId: endpointId,
      isEmptyEndpointId: false,
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

const EndpointTokenSelect: React.FC<EndpointTokenSelectProps> = ({
  endpointId,
  ...props
}) => {
  const [controllableValue, setControllableValue] =
    useControllableValue<string>(props);

  if (!endpointId) {
    return (
      <Input
        value={controllableValue}
        onChange={(e) => setControllableValue(e.target.value)}
        style={props.style}
      />
    );
  }

  return <EndpointTokenSelectWithQuery endpointId={endpointId} {...props} />;
};

export default EndpointTokenSelect;
