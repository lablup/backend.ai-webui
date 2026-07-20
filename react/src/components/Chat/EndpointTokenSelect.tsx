/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  EndpointTokenSelectQuery,
  EndpointTokenSelectQuery$data,
} from '../../__generated__/EndpointTokenSelectQuery.graphql';
import WebUILink from '../WebUILink';
import { SettingOutlined } from '@ant-design/icons';
import { useControllableValue } from 'ahooks';
import { Input, Select, Tooltip, theme } from 'antd';
import type { SelectProps } from 'antd';
import { BAIFlex, BAIText } from 'backend.ai-ui';
import dayjs from 'dayjs';
import { castArray, maxBy, sortBy } from 'lodash-es';
import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

function getValidTokenOptions(
  endpointTokenListData: EndpointTokenSelectQuery$data['endpoint_token_list'],
) {
  if (!endpointTokenListData.ok) return [];

  const now = dayjs();
  return (
    sortBy(endpointTokenListData.value?.items, 'created_at')
      .map((item) => ({
        token: item?.token ?? '',
        createdAt: item?.created_at,
        issued: dayjs.utc(item?.created_at).tz(),
        // FIXME: temporally parse UTC and change to timezone (timezone need to be added in server side)
        expires: item?.valid_until ? dayjs.utc(item.valid_until).tz() : null,
      }))
      // Hide expired (or never-valid) tokens — there are often many.
      .filter((item) => !!item.expires && item.expires.isAfter(now))
  );
}

interface EndpointTokenSelectProps extends Omit<SelectProps, 'options'> {
  endpointId?: string | null;
}

const EndpointTokenSelectWithQuery: React.FC<
  EndpointTokenSelectProps & {
    endpointId: string;
  }
> = ({ endpointId, style, ...props }) => {
  'use memo';
  const { t } = useTranslation();
  const { token: themeToken } = theme.useToken();
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
    // Refetch on mount so returning from token creation (e.g. via the Access
    // Token Settings shortcut) does not render a stale cached list — the
    // create-token flow writes to the deployment page's connection, not this
    // legacy EndpointTokenList, so store-only would miss the new token.
    { fetchPolicy: 'store-and-network' },
  );

  // Expired tokens are hidden (there are often many). Label each valid option
  // with a short token-tail chip — the differing end of the JWT, so the user can
  // match it against a token they hold; raw strings are otherwise
  // indistinguishable after truncation since they share the eyJhbGci… header —
  // plus its expiry date. The full issued → expiry timestamps show on hover as a
  // native tooltip (FR-3341).
  const validTokens = getValidTokenOptions(endpoint_token_list);
  const selectOptions = validTokens.map((item) => ({
    // The raw token stays as the value the form submits.
    value: item.token,
    label: (
      <BAIFlex
        title={`${item.issued.format('lll')} → ${item.expires?.format('lll') ?? '-'}`}
        gap="xs"
        align="center"
        style={{ overflow: 'hidden' }}
      >
        <BAIText code style={{ flexShrink: 0, margin: 0 }}>
          …{item.token.slice(-6)}
        </BAIText>
        <BAIText
          type="secondary"
          ellipsis
          style={{ flex: 1, minWidth: 0, fontSize: themeToken.fontSizeSM }}
        >
          ~ {item.expires?.format('ll') ?? '-'}
        </BAIText>
      </BAIFlex>
    ),
  }));

  // Default to the most recent valid token (latest created_at) when the field
  // is still empty. Applied once when tokens load; if the user clears the
  // selection it is not re-applied.
  const latestValidToken = maxBy(validTokens, 'createdAt')?.token;
  const applyDefaultToken = useEffectEvent(() => {
    if (!controllableValue && latestValidToken) {
      setControllableValue(latestValidToken);
    }
  });
  useEffect(() => {
    applyDefaultToken();
  }, [latestValidToken]);

  // Always render the Select (empty placeholder when there is no valid token)
  // with a compact link beside it to create a token in the deployment's Access
  // Tokens — a convenient shortcut shown regardless of whether tokens exist.
  return (
    <BAIFlex gap="xs" align="center">
      <Select
        placeholder={t('chatui.SelectToken')}
        // Fixed width so the token field looks the same across panel sizes
        // instead of following CustomModelForm's responsive 100%/200px width,
        // while still shrinking to fit narrow screens (maxWidth + minWidth 0).
        style={{
          ...style,
          width: 220,
          maxWidth: '100%',
          minWidth: 0,
          fontWeight: 'normal',
        }}
        options={selectOptions}
        value={controllableValue}
        onChange={(_, option) => {
          setControllableValue(castArray(option)?.[0].value ?? '');
        }}
        {...props}
      />
      <WebUILink
        to={`/deployments/${endpointId}#access-tokens`}
        aria-label={t('deployment.AccessTokenSettings')}
        style={{ flexShrink: 0, display: 'inline-flex' }}
      >
        <Tooltip title={t('deployment.AccessTokenSettings')}>
          <SettingOutlined style={{ color: themeToken.colorTextSecondary }} />
        </Tooltip>
      </WebUILink>
    </BAIFlex>
  );
};

const EndpointTokenSelect: React.FC<EndpointTokenSelectProps> = ({
  endpointId,
  ...props
}) => {
  'use memo';
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
