/**
 * PILOT 10 PHASE 6 — the converted page graph after the "zero antd except
 * Form" sweep, rendered from the REAL local components.
 *
 * Everything below is imported from `react/src`, not re-created:
 *   BAICardAstryx · BAITableAstryx · BAIPropertyFilterAstryx (PowerSearch)
 *   BAIFetchKeyButtonAstryx (+ BAICountdownBorderAstryx) · BAINameActionCellAstryx
 *   BAIDeleteConfirmModalAstryx · BAIModalAstryx · BAIQuestionIconWithTooltipAstryx
 *   BAISelectionLabel · astryxFormControls · BAITabs is exercised via TabList
 *
 * Two things are NOT mountable here and are annotated rather than faked:
 *   - `StorageSelectAstryx` needs `useSuspendedBackendaiClient` (a live
 *     cluster). Its popup shape is reproduced inline with the same primitives.
 *   - `BAIVFolderDeleteButtonAstryx` reads a Relay fragment.
 * Both are covered by the dev-server transform check instead.
 *
 * `?state=` selects which overlay is open so each acceptance shot is its own
 * deterministic frame: `page` | `create` | `delete`.
 */
import './probe.css';
import { backendAiAdminTheme } from '../src/astryx-theme/backendAiTheme';
import { BAIAppShimProvider } from '../src/app-shim';
import BAICardAstryx from '../src/components/astryx-bui/BAICardAstryx';
import BAIDeleteConfirmModal from '../src/components/astryx-bui/BAIDeleteConfirmModalAstryx';
import BAIFetchKeyButtonAstryx from '../src/components/astryx-bui/BAIFetchKeyButtonAstryx';
import BAIModalAstryx from '../src/components/astryx-bui/BAIModalAstryx';
import BAINameActionCell from '../src/components/astryx-bui/BAINameActionCellAstryx';
import BAIPropertyFilterAstryx from '../src/components/astryx-bui/BAIPropertyFilterAstryx';
import BAIQuestionIconWithTooltip from '../src/components/astryx-bui/BAIQuestionIconWithTooltipAstryx';
import BAISelectionLabel from '../src/components/astryx-bui/BAISelectionLabel';
import BAITableAstryx from '../src/components/astryx-bui/BAITableAstryx';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { ComplexSelector } from '@astryxdesign/core/ComplexSelector';
import { Divider } from '@astryxdesign/core/Divider';
import { Item } from '@astryxdesign/core/Item';
import { LayerProvider } from '@astryxdesign/core/Layer';
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Switch } from '@astryxdesign/core/Switch';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Theme } from '@astryxdesign/core/theme';
import {
  PlusIcon,
  ShareIcon,
  TrashIcon,
  RotateCcwIcon,
  FolderIcon,
} from 'lucide-react';
import i18next from 'i18next';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';

// Phase 4 recorded that the harness renders `{{count}}s` uninterpolated because
// it mounts no i18next instance. Fixed here with a minimal one carrying only the
// keys these components ask for, so the shots show real labels.
void i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['translation', 'comp'],
  defaultNS: 'translation',
  interpolation: { escapeValue: false },
  resources: {
    en: {
      translation: {
        general: {
          NSelected: '{{count}} selected',
          DeselectAll: 'Deselect all',
        },
      },
      comp: {
        BAIFetchKeyButton: {
          Refresh: 'Refresh',
          AutoRefresh: 'Auto Refresh',
          LastUpdated: 'Last Updated',
          Off: 'Off',
          EverySeconds: '{{count}}s',
          EveryMinutes: '{{count}}m',
          EveryHours: '{{count}}h',
        },
      },
    },
  },
});

interface Row extends Record<string, unknown> {
  id: string;
  name: string;
  status: string;
  host: string;
  ownership_type: string;
  cur_size: string;
}

const ROWS: Array<Row> = Array.from({ length: 8 }, (_, i) => ({
  id: String(i + 1),
  name:
    ['my-training-data', 'shared-models', '.automount-config'][i % 3] +
    `-${i + 1}`,
  status: ['ready', 'mounted', 'error'][i % 3],
  host: ['local:volume1', 'ceph:fast'][i % 2],
  ownership_type: ['user', 'group'][i % 2],
  cur_size: ['12.4 GB', '304 GB', '2 MB'][i % 3],
}));

const STATUS_VARIANT: Record<string, 'warning' | 'error' | 'neutral'> = {
  ready: 'warning',
  mounted: 'warning',
  error: 'error',
};

const FILTER_PROPERTIES = [
  { key: 'name', propertyLabel: 'Name', type: 'string' as const },
  {
    key: 'status',
    propertyLabel: 'Status',
    type: 'string' as const,
    strictSelection: true,
    defaultOperator: '==',
    options: ['READY', 'MOUNTED', 'ERROR', 'DELETE_PENDING'].map((s) => ({
      label: s,
      value: s,
    })),
  },
  { key: 'host', propertyLabel: 'Location', type: 'string' as const },
  {
    key: 'ownership_type',
    propertyLabel: 'Type',
    type: 'string' as const,
    strictSelection: true,
    defaultOperator: '==',
    options: [
      { label: 'User', value: 'user' },
      { label: 'Project', value: 'group' },
    ],
  },
];

/** Two active tokens, expressed in the real Backend.AI filter DSL. */
const INITIAL_FILTER = 'name ilike "%training%" & status == "READY"';

const HOSTS = [
  { host: 'local:volume1', percent: 41 },
  { host: 'ceph:fast', percent: 78 },
  { host: 'ceph:archive', percent: 94 },
  { host: 'nfs:shared', percent: undefined as number | undefined },
];

const usageVariant = (p: number | undefined) =>
  p === undefined
    ? ('neutral' as const)
    : p < 70
      ? ('success' as const)
      : p < 90
        ? ('warning' as const)
        : ('error' as const);
const usageLabel = (p: number | undefined) =>
  p === undefined
    ? 'Unknown'
    : p < 70
      ? 'Adequate'
      : p < 90
        ? 'Caution'
        : 'Insufficient';

/**
 * Shape-equivalent of `StorageSelectAstryx`'s popup (see the header note): the
 * same `ComplexSelector` + scroll container + `Item` + labelled usage `Badge`.
 */
const StorageSelectShape: React.FC = () => {
  const [value, setValue] = useState<string | undefined>('local:volume1');
  const [search, setSearch] = useState('');
  const rows = HOSTS.filter((h) => h.host.includes(search));
  return (
    <ComplexSelector<string | undefined>
      label="Location"
      isLabelHidden
      value={value}
      triggerLabel={
        value ? (
          <HStack gap={2} align="center">
            <Badge
              variant={usageVariant(
                HOSTS.find((h) => h.host === value)?.percent,
              )}
              label={usageLabel(HOSTS.find((h) => h.host === value)?.percent)}
            />
            <Text>{value}</Text>
          </HStack>
        ) : undefined
      }
      placeholder="Select a storage host"
      width="100%"
    >
      {(_v, _oc, close) => (
        <VStack gap={1} padding={2} width={320}>
          <TextInput
            label="Search hosts"
            isLabelHidden
            value={search}
            onChange={setSearch}
            placeholder="Select a storage host"
            hasClear
            size="sm"
          />
          <div style={{ maxHeight: 260, overflowY: 'auto' }} role="listbox">
            {rows.map((h) => (
              <Item
                key={h.host}
                density="compact"
                isSelected={h.host === value}
                label={h.host}
                startContent={
                  <Badge
                    variant={usageVariant(h.percent)}
                    label={usageLabel(h.percent)}
                  />
                }
                onClick={() => {
                  setValue(h.host);
                  close();
                }}
              />
            ))}
          </div>
        </VStack>
      )}
    </ComplexSelector>
  );
};

const FormRow: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, required, children }) => (
  <HStack gap={4} align="start" style={{ marginBottom: 12 }}>
    <div style={{ width: 150, flexShrink: 0, paddingTop: 6 }}>
      <Text>
        {required ? <span style={{ color: 'var(--color-text-error)' }}>* </span> : null}
        {label}
      </Text>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </HStack>
);

const CreateFolderModalShape: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const [name, setName] = useState('');
  const [usage, setUsage] = useState('general');
  const [type, setType] = useState('user');
  const [cloneable, setCloneable] = useState(false);
  return (
    <BAIModalAstryx
      isOpen={isOpen}
      title="Create folder"
      width={650}
      actionLabel="Create"
      cancelLabel="Cancel"
    >
      <VStack align="stretch" gap={0}>
        <Banner
          status="warning"
          title="Project folders created here are visible to every project member."
          container="section"
        />
        <div style={{ height: 16 }} />
        <FormRow label="Usage mode" required>
          <RadioList
            value={usage}
            onChange={setUsage}
            label="Usage mode"
            isLabelHidden
            orientation="horizontal"
          >
            <RadioListItem value="general" label="General" />
            <RadioListItem value="model" label="Models" />
            <RadioListItem
              value="automount"
              label="AutoMount"
              endContent={
                <BAIQuestionIconWithTooltip title="AutoMount folders are mounted into every session automatically." />
              }
            />
          </RadioList>
        </FormRow>
        <Divider />
        <FormRow label="Folder name" required>
          <TextInput
            label="Folder name"
            isLabelHidden
            value={name}
            onChange={setName}
            placeholder="Up to 64 characters"
            width="100%"
          />
        </FormRow>
        <Divider />
        <FormRow label="Location" required>
          <StorageSelectShape />
        </FormRow>
        <Divider />
        <FormRow label="Type" required>
          <RadioList
            value={type}
            onChange={setType}
            label="Type"
            isLabelHidden
            orientation="horizontal"
          >
            <RadioListItem value="user" label="User" />
            <RadioListItem value="project" label="Project" />
          </RadioList>
        </FormRow>
        <Divider />
        <FormRow label="Cloneable">
          <Switch
            value={cloneable}
            onChange={setCloneable}
            label="Cloneable"
            isLabelHidden
          />
        </FormRow>
      </VStack>
    </BAIModalAstryx>
  );
};

const Page: React.FC<{ state: string }> = ({ state }) => {
  const [tab, setTab] = useState('active');
  const [mode, setMode] = useState('all');
  const [filter, setFilter] = useState<string | undefined>(INITIAL_FILTER);
  const [selected, setSelected] = useState<Array<string>>(['2', '4']);
  const [order, setOrder] = useState<string | null>('-name');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [delay, setDelay] = useState<number | null>(5_000);
  const [overrides, setOverrides] = useState({});

  return (
    <div style={{ padding: 24 }}>
      <BAICardAstryx title="Folders">
        <TabList value={tab} onChange={setTab} hasDivider>
          <Tab
            value="active"
            label="Active"
            endContent={
              <Badge label={12} variant={tab === 'active' ? 'info' : 'neutral'} />
            }
          />
          <Tab
            value="deleted"
            label="Trash Bin"
            endContent={
              <Badge label={3} variant={tab === 'deleted' ? 'info' : 'neutral'} />
            }
          />
        </TabList>
        <VStack align="stretch" gap={3} style={{ marginTop: 12 }}>
          <HStack justify="between" wrap="wrap" gap={3}>
            <HStack gap={3} align="start" wrap="wrap" style={{ flexShrink: 1 }}>
              <SegmentedControl value={mode} onChange={setMode} label="Mode">
                <SegmentedControlItem value="all" label="All" />
                <SegmentedControlItem value="general" label="General" />
                <SegmentedControlItem value="automount" label="AutoMount" />
                <SegmentedControlItem value="model" label="Models" />
              </SegmentedControl>
              <BAIPropertyFilterAstryx
                filterProperties={FILTER_PROPERTIES}
                value={filter}
                onChange={setFilter}
                label="Search"
                placeholder="Search by name"
                applyLabel="Apply"
                contentSearchFieldKey="name"
                resultCount={`${ROWS.length} items`}
                operatorLabels={{
                  contains: 'contains',
                  equals: 'is',
                  notEquals: 'is not',
                }}
                style={{ minWidth: 380 }}
              />
            </HStack>
            <HStack gap={2} align="center">
              <BAISelectionLabel
                count={selected.length}
                onClearSelection={() => setSelected([])}
              />
              <BAIFetchKeyButtonAstryx
                onChange={() => {}}
                autoUpdateDelay={delay}
                onChangeAutoUpdateDelay={setDelay}
              />
              <Button variant="primary" icon={<PlusIcon />} label="Create folder" />
            </HStack>
          </HStack>
          <BAITableAstryx<Row>
            density="compact"
            isColumnResizable
            idKey={(r) => r.id}
            data={ROWS.slice((page - 1) * pageSize, page * pageSize)}
            order={order}
            onChangeOrder={(next) => setOrder(next ?? null)}
            columns={[
              {
                key: 'name',
                header: 'Name',
                dataIndex: 'name',
                isRequired: true,
                sortable: true,
                renderCell: (item: Row) => (
                  <BAINameActionCell
                    icon={<FolderIcon />}
                    title={item.name}
                    to={`#${item.id}`}
                    onTitleClick={() => {}}
                    showActions="always"
                    actions={[
                      { key: 'share', title: 'Share', icon: <ShareIcon /> },
                      {
                        key: 'restore',
                        title: 'Restore',
                        icon: <RotateCcwIcon />,
                        confirm: {
                          title: 'Restore',
                          description: item.name,
                          confirmLabel: 'Confirm',
                          cancelLabel: 'Cancel',
                        },
                      },
                      {
                        key: 'delete',
                        title: 'Move to trash',
                        icon: <TrashIcon />,
                        type: 'danger' as const,
                      },
                    ]}
                  />
                ),
              },
              {
                key: 'status',
                header: 'Status',
                dataIndex: 'status',
                sortable: true,
                renderCell: (item: Row) => (
                  <Badge
                    variant={STATUS_VARIANT[item.status] ?? 'neutral'}
                    label={String(item.status).toUpperCase()}
                  />
                ),
              },
              { key: 'host', header: 'Location', dataIndex: 'host', sortable: true },
              {
                key: 'ownership_type',
                header: 'Type',
                dataIndex: 'ownership_type',
                sortable: true,
              },
              { key: 'cur_size', header: 'Folder usage', dataIndex: 'cur_size' },
            ]}
            rowSelection={{ selectedKeys: selected, onChange: setSelected }}
            pagination={{
              pageSize,
              current: page,
              total: ROWS.length,
              onChange: (nextPage, nextSize) => {
                setPage(nextPage);
                setPageSize(nextSize);
              },
            }}
            tableSettings={{
              columnOverrides: overrides,
              onColumnOverridesChange: setOverrides,
            }}
          />
        </VStack>
      </BAICardAstryx>

      <CreateFolderModalShape isOpen={state === 'create'} />

      <BAIDeleteConfirmModal
        isOpen={state === 'delete'}
        title="Delete Forever?"
        description={`The folder "my-training-data-1" will be permanently deleted and cannot be restored.`}
        items={[{ key: '1', label: 'my-training-data-1' }]}
        confirmText="my-training-data-1"
        requireConfirmInput
        inputLabel="Please type my-training-data-1 to confirm."
        inputPlaceholder="my-training-data-1"
        cannotBeUndoneText="WARNING: this cannot be undone!"
        actionLabel="Delete forever"
        cancelLabel="Cancel"
      />
    </div>
  );
};

const App: React.FC = () => {
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const state = new URLSearchParams(window.location.search).get('state') ?? 'page';
  return (
    <Theme theme={backendAiAdminTheme} mode={dark ? 'dark' : 'light'}>
      <LayerProvider>
        <BAIAppShimProvider>
          <Page state={state} />
        </BAIAppShimProvider>
      </LayerProvider>
    </Theme>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
