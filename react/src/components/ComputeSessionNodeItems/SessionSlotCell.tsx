import { convertBinarySizeUnit } from '../../helper';
import { useResourceSlotsDetails } from '../../hooks/backendai';
import { SessionSlotCellFragment$key } from './__generated__/SessionSlotCellFragment.graphql';
import { Divider, Typography } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { Fragment } from 'react';
import { useFragment } from 'react-relay';

interface OccupiedSlotViewProps {
  sessionFrgmt: SessionSlotCellFragment$key;
  type: 'cpu' | 'mem' | 'accelerator';
  mode?: 'occupied' | 'requested';
}
const SessionSlotCell: React.FC<OccupiedSlotViewProps> = ({
  type,
  sessionFrgmt,
  mode = 'requested',
}) => {
  const { deviceMetadata } = useResourceSlotsDetails();
  const session = useFragment(
    graphql`
      fragment SessionSlotCellFragment on ComputeSessionNode {
        id
        occupied_slots
        requested_slots
      }
    `,
    sessionFrgmt,
  );

  const slots = JSON.parse(
    (mode === 'occupied' ? session.occupied_slots : session.requested_slots) ||
      '{}',
  );

  if (type === 'cpu') {
    return slots.cpu ?? '-';
  } else if (type === 'mem') {
    const mem = slots.mem ?? '-';
    return mem === '-' ? mem : convertBinarySizeUnit(mem, 'G')?.number + ' GiB';
  } else if (type === 'accelerator') {
    const occupiedAccelerators = _.omit(slots, ['cpu', 'mem']);
    return _.isEmpty(occupiedAccelerators)
      ? '-'
      : _.map(occupiedAccelerators, (value, key) => {
          return (
            <Fragment key={key}>
              <Typography.Text>{value}</Typography.Text>
              <Divider type="vertical" />
              <Typography.Text>
                {deviceMetadata?.[key]?.human_readable_name}
              </Typography.Text>
            </Fragment>
          );
        });
  }
};

export default SessionSlotCell;
