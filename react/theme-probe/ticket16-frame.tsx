/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 probe — the page chrome case (AFTER-only; the before shots use the
 real page which cannot mount without a live backend). Composes the same
 converted building blocks the three Data pages use: `BAICardAstryx` (title +
 extra), `BAITabs` (label + count badge in `endContent`), `BAIRadioGroup`
 (SegmentedControl), `BAIPropertyFilterAstryx` (PowerSearch) and
 `BAISelectionLabel`.
*/
import BAIRadioGroup from '../src/components/BAIRadioGroup';
import BAITabs from '../src/components/BAITabs';
import BAICard from '../src/components/astryx-bui/BAICardAstryx';
import BAIPropertyFilter from '../src/components/astryx-bui/BAIPropertyFilterAstryx';
import BAISelectionLabel from '../src/components/astryx-bui/BAISelectionLabel';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import React, { useState } from 'react';

const FrameCase: React.FC = () => {
  const [tab, setTab] = useState('active');
  const [tabMode, setTabMode] = useState('all');
  const [filter, setFilter] = useState<string | undefined>(
    'name ilike "%data%"',
  );
  return (
    <VStack align="stretch" gap={5} padding={6}>
      <BAICard
        title="Folders"
        extra={<Button variant="primary" label="Create Folder" />}
      >
        <BAITabs
          activeKey={tab}
          onChange={setTab}
          items={[
            {
              key: 'active',
              label: 'Active',
              endContent: (
                <Badge label={12} variant={tab === 'active' ? 'info' : 'neutral'} />
              ),
            },
            {
              key: 'deleted',
              label: 'Trash Bin',
              endContent: (
                <Badge
                  label={3}
                  variant={tab === 'deleted' ? 'info' : 'neutral'}
                />
              ),
            },
          ]}
        />
        <VStack align="stretch" gap={3}>
          <HStack justify="between" wrap="wrap" gap={3}>
            <HStack gap={3} align="start" wrap="wrap">
              <BAIRadioGroup
                optionType="button"
                value={tabMode}
                onChange={(e) => setTabMode(e.target.value)}
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'General', value: 'general' },
                  { label: 'Automount', value: 'automount' },
                  { label: 'Models', value: 'model' },
                ]}
              />
              <BAIPropertyFilter
                style={{ minWidth: 320, flex: 1 }}
                label="Search"
                placeholder="Search by name"
                applyLabel="Apply"
                contentSearchFieldKey="name"
                resultCount="Total 12 items"
                filterProperties={[
                  { key: 'name', propertyLabel: 'Name', type: 'string' },
                  {
                    key: 'status',
                    propertyLabel: 'Status',
                    type: 'string',
                    strictSelection: true,
                    defaultOperator: '==',
                    options: [
                      { label: 'READY', value: 'READY' },
                      { label: 'ERROR', value: 'ERROR' },
                    ],
                  },
                ]}
                value={filter}
                onChange={setFilter}
              />
            </HStack>
            <HStack gap={2}>
              <BAISelectionLabel count={2} onClearSelection={() => {}} />
              <Button variant="primary" label="Create Folder" />
            </HStack>
          </HStack>
        </VStack>
      </BAICard>
    </VStack>
  );
};

export default FrameCase;
