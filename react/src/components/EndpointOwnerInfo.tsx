import { EndpointOwnerInfoFragment$key } from '../__generated__/EndpointOwnerInfoFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Tooltip, theme } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface EndpointOwnerInfoProps {
  endpointFrgmt: EndpointOwnerInfoFragment$key | null | undefined;
}
const EndpointOwnerInfo: React.FC<EndpointOwnerInfoProps> = ({
  endpointFrgmt,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();

  const endpoint = useFragment(
    graphql`
      fragment EndpointOwnerInfoFragment on Endpoint {
        id
        created_user_email @since(version: "23.09.8")
        session_owner_email @since(version: "23.09.8")
      }
    `,
    endpointFrgmt,
  );

  if (!baiClient.supports('model-serving-endpoint-user-info'))
    return baiClient.email || '';
  if (endpoint?.created_user_email === endpoint?.session_owner_email)
    return endpoint?.session_owner_email || '';
  else
    return (
      <>
        {endpoint?.session_owner_email || ''}
        <Tooltip
          title={t('modelService.ServiceDelegatedFrom', {
            createdUser: endpoint?.created_user_email || '',
            sessionOwner: endpoint?.session_owner_email || '',
          })}
        >
          <Button
            size="small"
            type="text"
            icon={<QuestionCircleOutlined />}
            style={{ color: token.colorTextSecondary }}
          />
        </Tooltip>
      </>
    );
};

export default EndpointOwnerInfo;
