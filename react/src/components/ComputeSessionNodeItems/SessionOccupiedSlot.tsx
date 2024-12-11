import { convertBinarySizeUnit } from '../../helper';
import { useResourceSlotsDetails } from '../../hooks/backendai';
import { SessionOccupiedSlotFragment$key } from './__generated__/SessionOccupiedSlotFragment.graphql';
import { Divider, Typography } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React from 'react';
import { useFragment } from 'react-relay';

interface OccupiedSlotViewProps {
  sessionFrgmt: SessionOccupiedSlotFragment$key;
  type: 'cpu' | 'mem' | 'accelerator';
}
const SessionOccupiedSlot: React.FC<OccupiedSlotViewProps> = ({
  type,
  sessionFrgmt,
}) => {
  const { deviceMetadata } = useResourceSlotsDetails();
  const session = useFragment(
    graphql`
      fragment SessionOccupiedSlotFragment on ComputeSessionNode {
        id
        occupied_slots
      }
    `,
    sessionFrgmt,
  );

  const occupiedSlots = JSON.parse(session.occupied_slots || '{}');

  if (type === 'cpu') {
    return occupiedSlots.cpu ?? '-';
  } else if (type === 'mem') {
    const mem = occupiedSlots.mem ?? '-';
    return mem === '-' ? mem : convertBinarySizeUnit(mem, 'G')?.number + ' GiB';
  } else if (type === 'accelerator') {
    const occupiedAccelerators = _.omit(occupiedSlots, ['cpu', 'mem']);
    return _.isEmpty(occupiedAccelerators)
      ? '-'
      : _.map(occupiedAccelerators, (value, key) => {
          return (
            <>
              <Typography.Text>{value}</Typography.Text>
              <Divider type="vertical" />
              <Typography.Text>
                {deviceMetadata?.[key]?.human_readable_name}
              </Typography.Text>
            </>
          );
        });
  }
};

export default SessionOccupiedSlot;
