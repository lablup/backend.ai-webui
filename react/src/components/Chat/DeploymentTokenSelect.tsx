/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  DeploymentTokenSelectQuery,
  DeploymentTokenSelectQuery$data,
} from '../../__generated__/DeploymentTokenSelectQuery.graphql';
import { theme } from '../../theme-shim';
import WebUILink from '../WebUILink';
import { useControllableValue } from 'ahooks';
import { Input, Select, Tooltip } from 'antd';
import type { SelectProps } from 'antd';
import {
  BAIFlex,
  BAIText,
  filterOutNullAndUndefined,
  toGlobalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { castArray, maxBy } from 'lodash-es';
import { Settings } from 'lucide-react';
import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

function getValidTokenOptions(
  deploymentData: DeploymentTokenSelectQuery$data['deployment'],
) {
  if (!deploymentData.ok) return [];

  const now = dayjs();
  const tokens = filterOutNullAndUndefined(
    deploymentData.value?.accessTokens?.edges?.map((edge) => edge?.node),
  );
  return (
    tokens
      .map((item) => ({
        token: item.token ?? '',
        createdAt: item.createdAt,
        issued: dayjs(item.createdAt),
        // A null `expiresAt` means the token never expires — this mirrors the
        // deployment's Access Tokens table (which shows "No expiration"). Read
        // the same Strawberry `accessTokens` connection as that page so both
        // surfaces agree on each token's expiry (FR-3341).
        expires: item.expiresAt ? dayjs(item.expiresAt) : null,
      }))
      // Hide only tokens that have already expired. Never-expiring tokens
      // (expires === null) are always valid and kept.
      .filter((item) => !item.expires || item.expires.isAfter(now))
  );
}

interface DeploymentTokenSelectProps extends Omit<SelectProps, 'options'> {
  deploymentId?: string | null;
}

const DeploymentTokenSelectWithQuery: React.FC<
  DeploymentTokenSelectProps & {
    deploymentId: string;
  }
> = ({ deploymentId, style, ...props }) => {
  'use memo';
  const { t } = useTranslation();
  const { token: themeToken } = theme.useToken();
  const [controllableValue, setControllableValue] =
    useControllableValue<string>(props);

  const { deployment } = useLazyLoadQuery<DeploymentTokenSelectQuery>(
    graphql`
      query DeploymentTokenSelectQuery($deploymentId: ID!) {
        deployment(id: $deploymentId) @catch {
          accessTokens(orderBy: [{ field: CREATED_AT, direction: DESC }]) {
            edges {
              node {
                id
                token
                createdAt
                expiresAt
              }
            }
          }
        }
      }
    `,
    {
      // `deploymentId` is the ModelDeployment's local UUID; the Strawberry
      // `deployment(id:)` field takes the global Relay ID. This component only
      // mounts with a non-empty deploymentId (the outer DeploymentTokenSelect
      // renders a plain Input otherwise), so no client-skip guard is needed.
      deploymentId: toGlobalId('ModelDeployment', deploymentId),
    },
    // Refetch on mount so returning from token creation (e.g. via the Access
    // Token Settings shortcut) does not render a stale cached list. This reads
    // the same `accessTokens` connection the create-token flow writes to, so a
    // freshly created token shows up here too.
    { fetchPolicy: 'store-and-network' },
  );

  // Expired tokens are hidden (there are often many). Label each valid option
  // with a short token-tail chip — the differing end of the JWT, so the user can
  // match it against a token they hold; raw strings are otherwise
  // indistinguishable after truncation since they share the eyJhbGci… header —
  // plus its expiry date. The full issued → expiry timestamps show on hover as a
  // native tooltip (FR-3341).
  const validTokens = getValidTokenOptions(deployment);
  const noExpirationLabel = t('deployment.accessToken.NoExpiration');
  const selectOptions = validTokens.map((item) => ({
    // The raw token stays as the value the form submits.
    value: item.token,
    label: (
      <BAIFlex
        title={`${item.issued.format('lll')} → ${item.expires?.format('lll') ?? noExpirationLabel}`}
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
          {item.expires ? `~ ${item.expires.format('ll')}` : noExpirationLabel}
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
        to={`/deployments/${deploymentId}#access-tokens`}
        aria-label={t('deployment.AccessTokenSettings')}
        style={{ flexShrink: 0, display: 'inline-flex' }}
      >
        <Tooltip title={t('deployment.AccessTokenSettings')}>
          <Settings
            style={{ color: themeToken.colorTextSecondary }}
            size="1em"
          />
        </Tooltip>
      </WebUILink>
    </BAIFlex>
  );
};

const DeploymentTokenSelect: React.FC<DeploymentTokenSelectProps> = ({
  deploymentId,
  ...props
}) => {
  'use memo';
  const [controllableValue, setControllableValue] =
    useControllableValue<string>(props);

  if (!deploymentId) {
    return (
      <Input
        value={controllableValue}
        onChange={(e) => setControllableValue(e.target.value)}
        style={props.style}
        disabled={props.disabled}
      />
    );
  }

  return (
    <DeploymentTokenSelectWithQuery deploymentId={deploymentId} {...props} />
  );
};

export default DeploymentTokenSelect;
