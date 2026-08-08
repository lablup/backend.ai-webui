/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  DeploymentTokenSelectQuery,
  DeploymentTokenSelectQuery$data,
} from '../../__generated__/DeploymentTokenSelectQuery.graphql';
import WebUILink from '../WebUILink';
import { Code } from '@astryxdesign/core/Code';
import type { SelectorOptionData } from '@astryxdesign/core/Selector';
import { Selector } from '@astryxdesign/core/Selector';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { useControllableValue } from 'ahooks';
import { BAIFlex, filterOutNullAndUndefined, toGlobalId } from 'backend.ai-ui';
import dayjs from 'dayjs';
import { maxBy } from 'lodash-es';
import { Settings } from 'lucide-react';
import { useEffect, useEffectEvent } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

// PILOT-DECISION: the antd `SelectProps` extension is gone — this component
// never used more than `value`/`onChange`/`style`/`disabled` from it (grepped
// call sites: CustomModelForm, DeploymentSettingModal). Astryx `Selector`'s
// own contract (required string `value`, `onChange(value)`) replaces it.
interface DeploymentTokenSelectProps {
  deploymentId?: string | null;
  value?: string;
  onChange?: (value: string) => void;
  style?: CSSProperties;
  disabled?: boolean;
  loading?: boolean;
}

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

const DeploymentTokenSelectWithQuery: React.FC<
  DeploymentTokenSelectProps & {
    deploymentId: string;
  }
> = ({ deploymentId, style, loading, ...props }) => {
  'use memo';
  const { t } = useTranslation();
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
  // PILOT-DECISION: antd `Select.options[].label` accepted a `ReactNode`
  // (a two-line token-tail + expiry row). Astryx `Selector`'s `label` is a
  // required `string` (P2) — kept as the searchable/fallback text, with the
  // rich two-line row moved to `renderOption` (MAPPING.md §3.1's "everything
  // else" branch). The hover tooltip (full issued -> expiry timestamp) has
  // no destination on a Selector option row and is dropped.
  const selectOptions: SelectorOptionData[] = validTokens.map((item) => ({
    value: item.token,
    label: `…${item.token.slice(-6)}`,
  }));
  const renderTokenOption = (option: SelectorOptionData) => {
    const item = validTokens.find((v) => v.token === option.value);
    if (!item) return option.label;
    return (
      <BAIFlex gap="xs" align="center" style={{ overflow: 'hidden' }}>
        <Code style={{ flexShrink: 0 }}>…{item.token.slice(-6)}</Code>
        <Text
          color="secondary"
          maxLines={1}
          style={{ flex: 1, minWidth: 0, fontSize: 'var(--font-size-sm)' }}
        >
          {item.expires ? `~ ${item.expires.format('ll')}` : noExpirationLabel}
        </Text>
      </BAIFlex>
    );
  };

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
      <Selector
        label={t('chatui.SelectToken')}
        isLabelHidden
        placeholder={t('chatui.SelectToken')}
        // Fixed width so the token field looks the same across panel sizes
        // instead of following CustomModelForm's responsive 100%/200px width,
        // while still shrinking to fit narrow screens (maxWidth + minWidth 0).
        style={{ ...style, minWidth: 0 }}
        width={220}
        options={selectOptions}
        renderOption={renderTokenOption}
        value={controllableValue || undefined}
        onChange={(v) => setControllableValue(v)}
        isDisabled={props.disabled}
        isLoading={loading}
      />
      <WebUILink
        to={`/deployments/${deploymentId}#access-tokens`}
        aria-label={t('deployment.AccessTokenSettings')}
        style={{ flexShrink: 0, display: 'inline-flex' }}
      >
        <Tooltip content={t('deployment.AccessTokenSettings')}>
          <Settings
            style={{ color: 'var(--color-text-secondary)' }}
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
  const { t } = useTranslation();
  const [controllableValue, setControllableValue] =
    useControllableValue<string>(props);

  if (!deploymentId) {
    return (
      <TextInput
        label={t('chatui.SelectToken')}
        isLabelHidden
        value={controllableValue ?? ''}
        onChange={(v) => setControllableValue(v)}
        style={props.style}
        isDisabled={props.disabled}
      />
    );
  }

  return (
    <DeploymentTokenSelectWithQuery deploymentId={deploymentId} {...props} />
  );
};

export default DeploymentTokenSelect;
