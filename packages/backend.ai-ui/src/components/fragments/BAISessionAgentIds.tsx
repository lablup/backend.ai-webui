import { BAISessionAgentIdsFragment$key } from '../../__generated__/BAISessionAgentIdsFragment.graphql';
import BAIFlex from '../BAIFlex';
import { CopyOutlined } from '@ant-design/icons';
import { Popover, Typography, Button, theme } from 'antd';
import _ from 'lodash';
import React, { useMemo } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface BAISessionAgentIdsProps {
  sessionFrgmt: BAISessionAgentIdsFragment$key;
  maxInline?: number; // New prop to control max inline display
  emptyText?: string; // New prop for empty state text
}
export const BAISessionAgentIds: React.FC<BAISessionAgentIdsProps> = ({
  sessionFrgmt,
  maxInline = 3,
  emptyText = '-',
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const session = useFragment(
    graphql`
      fragment BAISessionAgentIdsFragment on ComputeSessionNode {
        agent_ids
      }
    `,
    sessionFrgmt,
  );

  const agents = useMemo(
    () => _.uniq(session.agent_ids ?? []),
    [session.agent_ids],
  );

  const inline = agents.slice(0, maxInline).join(', ');
  const rest = agents.slice(maxInline);
  const restCount = _.max([agents.length - maxInline, 0]) || 0;

  return agents.length === 0 ? (
    emptyText
  ) : (
    <span>
      <Typography.Text>{inline}</Typography.Text>
      {restCount > 0 && (
        <>
          &nbsp;
          <Popover
            trigger="click"
            title={
              <BAIFlex justify="between">
                <span>
                  {t('comp:BAISessionAgentIds.Agent')} ({agents.length})
                </span>
                <CopyToClipboard text={agents.join(', ')}>
                  <Button size="small" type="text" icon={<CopyOutlined />}>
                    {t('general.button.CopyAll')}
                  </Button>
                </CopyToClipboard>
              </BAIFlex>
            }
            content={
              <div style={{ maxHeight: 240, overflow: 'auto', minWidth: 260 }}>
                <ul style={{ paddingLeft: token.padding, margin: 0 }}>
                  {rest.map((id) => (
                    <li key={id} style={{ listStyle: 'disc' }}>
                      <Typography.Text>{id}</Typography.Text>
                    </li>
                  ))}
                </ul>
              </div>
            }
          >
            <Typography.Link>+{restCount}</Typography.Link>
          </Popover>
        </>
      )}
    </span>
  );
};
