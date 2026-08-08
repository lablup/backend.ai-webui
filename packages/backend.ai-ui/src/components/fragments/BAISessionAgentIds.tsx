/*
 to-astryx W2-D: antd `Popover` -> Astryx `Popover` (MAPPING §4),
 `Typography.Text`/`Typography.Link` -> Astryx `Text`/`Link`,
 antd `Button` -> `BAIButton` (already Astryx-backed).

 PILOT-DECISION — **antd's `Popover title` slot is folded into `content`.**
 Astryx `Popover` has `content` plus a `label` that is the popover's ACCESSIBLE
 name (a plain string), not a rendered header — antd's `title` was a rendered
 row that here also carries the "Copy All" action. So the header row moves to
 the top of `content`, and `label` gets the plain-text agent count so the
 dialog announces itself. `trigger="click"` is dropped: click is Astryx
 `Popover`'s only trigger (hover is `HoverCard`).
*/
import { BAISessionAgentIdsFragment$key } from '../../__generated__/BAISessionAgentIdsFragment.graphql';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIButton from '../BAIButton';
import BAIFlex from '../BAIFlex';
import { Link } from '@astryxdesign/core/Link';
import { Popover } from '@astryxdesign/core/Popover';
import { Text } from '@astryxdesign/core/Text';
import * as _ from 'lodash-es';
import { Copy } from 'lucide-react';
import React, { useMemo } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { graphql, useFragment } from 'react-relay';

interface BAISessionAgentIdsProps {
  sessionFrgmt: BAISessionAgentIdsFragment$key;
  maxInline?: number;
  emptyText?: string;
}
const BAISessionAgentIds: React.FC<BAISessionAgentIdsProps> = ({
  sessionFrgmt,
  maxInline = 3,
  emptyText = '-',
}) => {
  const { t } = useBAIi18n();
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
  const heading = `${t('comp:BAISessionAgentIds.Agent')} (${agents.length})`;

  return agents.length === 0 ? (
    emptyText
  ) : (
    <span>
      <Text>{inline}</Text>
      {restCount > 0 && (
        <>
          &nbsp;
          <Popover
            label={heading}
            content={
              <div style={{ maxHeight: 240, overflow: 'auto', minWidth: 260 }}>
                <BAIFlex justify="between" align="center">
                  <span>{heading}</span>
                  <CopyToClipboard text={agents.join(', ')}>
                    <BAIButton
                      size="small"
                      type="text"
                      icon={<Copy size="1em" />}
                    >
                      {t('general.button.CopyAll')}
                    </BAIButton>
                  </CopyToClipboard>
                </BAIFlex>
                {/* A plain list indent, not a design-system surface — a
                    literal keeps it honest rather than inventing a token
                    name Astryx does not declare (P19). */}
                <ul style={{ paddingLeft: 16, margin: 0 }}>
                  {rest.map((id) => (
                    <li key={id} style={{ listStyle: 'disc' }}>
                      <Text>{id}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            }
          >
            <Link>+{restCount}</Link>
          </Popover>
        </>
      )}
    </span>
  );
};

export default BAISessionAgentIds;
