/**
 * PILOT 10 PHASE 4 — the restored page frame, side by side with antd.
 *
 * Left  = antd: Card(tabList) + extra actions + Table + pagination + gear.
 * Right = the real local Astryx components under the admin accent theme.
 */
import './probe.css';
import { backendAiAdminTheme } from '../src/astryx-theme/backendAiTheme';
import BAICardAstryx from '../src/components/astryx-bui/BAICardAstryx';
import BAIFetchKeyButtonAstryx from '../src/components/astryx-bui/BAIFetchKeyButtonAstryx';
import BAIFlexAstryx from '../src/components/astryx-bui/BAIFlexAstryx';
import BAIButtonAstryx from '../src/components/astryx-bui/BAIButtonAstryx';
import BAITableAstryx from '../src/components/astryx-bui/BAITableAstryx';
import { BAITag } from '../src/components/astryx-bui/smallPrimitives';
import { Badge } from '@astryxdesign/core/Badge';
import { LayerProvider } from '@astryxdesign/core/Layer';
import { Theme } from '@astryxdesign/core/theme';
import { Badge as ABadge, Button, Card, ConfigProvider, Table, Tag, theme } from 'antd';
import { PlusIcon, RefreshCwIcon } from 'lucide-react';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

const ORANGE = '#FF7A00';

interface Row extends Record<string, unknown> {
  id: string;
  name: string;
  status: string;
  host: string;
  ownership_type: string;
  cur_size: string;
}

const ROWS: Array<Row> = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  name: ['my-training-data', 'shared-models', '.automount-config'][i % 3] + `-${i + 1}`,
  status: ['ready', 'mounted', 'error'][i % 3],
  host: ['local:volume1', 'ceph:fast'][i % 2],
  ownership_type: ['user', 'group'][i % 2],
  cur_size: ['12.4 GB', '304 GB', '2 MB'][i % 3],
}));

const COLUMNS = [
  { key: 'name', title: 'Name', dataIndex: 'name', required: true, sorter: true },
  { key: 'status', title: 'Status', dataIndex: 'status', sorter: true },
  { key: 'host', title: 'Location', dataIndex: 'host', sorter: true },
  { key: 'ownership_type', title: 'Type', dataIndex: 'ownership_type', sorter: true },
  { key: 'cur_size', title: 'Folder usage', dataIndex: 'cur_size' },
];

const AntdSide: React.FC<{ dark: boolean }> = ({ dark }) => {
  const [selected, setSelected] = useState<Array<React.Key>>(['2']);
  const [tab, setTab] = useState('active');
  const [page, setPage] = useState(1);
  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: ORANGE },
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div className="col">
        <div className="col-head">antd — BEFORE</div>
        <Card
          title="Folders"
          variant="borderless"
          activeTabKey={tab}
          onTabChange={setTab}
          tabList={[
            {
              key: 'active',
              label: (
                <span style={{ display: 'inline-flex', gap: 8 }}>
                  Active <ABadge count={12} color={ORANGE} size="small" />
                </span>
              ),
            },
            { key: 'deleted', label: 'Trash Bin' },
          ]}
          extra={
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <Button icon={<RefreshCwIcon size={14} />} />
              <Button type="primary" icon={<PlusIcon size={14} />}>
                Create folder
              </Button>
            </span>
          }
        >
          <Table<Row>
            size="small"
            rowKey="id"
            dataSource={ROWS}
            columns={COLUMNS.map((c) => ({
              ...c,
              render:
                c.key === 'status'
                  ? (v: string) => <Tag color="warning">{v.toUpperCase()}</Tag>
                  : undefined,
            }))}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selected,
              onChange: setSelected,
            }}
            pagination={{
              pageSize: 10,
              current: page,
              total: 12,
              onChange: setPage,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
            }}
          />
        </Card>
      </div>
    </ConfigProvider>
  );
};

const AstryxSide: React.FC = () => {
  const [selected, setSelected] = useState<Array<React.Key>>(['2']);
  const [tab, setTab] = useState('active');
  const [order, setOrder] = useState<string | null>('-name');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [delay, setDelay] = useState<number | null>(30_000);
  const [overrides, setOverrides] = useState({});
  return (
    <div className="col">
      <div className="col-head">Astryx — AFTER</div>
      <BAICardAstryx
        title="Folders"
        variant="borderless"
        activeTabKey={tab}
        onTabChange={setTab}
        tabList={[
          {
            key: 'active',
            label: 'Active',
            endContent: <Badge label={12} variant="info" />,
          },
          { key: 'deleted', label: 'Trash Bin' },
        ]}
        extra={
          <BAIFlexAstryx gap="xs" align="center">
            <BAIFetchKeyButtonAstryx
              onChange={() => {}}
              autoUpdateDelay={delay}
              onChangeAutoUpdateDelay={setDelay}
            />
            <BAIButtonAstryx type="primary" icon={<PlusIcon />}>
              Create folder
            </BAIButtonAstryx>
          </BAIFlexAstryx>
        }
      >
        <BAITableAstryx<Row>
          size="small"
          resizable
          rowKey={(r) => r.id}
          dataSource={ROWS.slice((page - 1) * pageSize, page * pageSize)}
          order={order}
          onChangeOrder={(next) => setOrder(next ?? null)}
          columns={COLUMNS.map((c) => ({
            ...c,
            render:
              c.key === 'status'
                ? ((v: never) => (
                    <BAITag color="warning">{String(v).toUpperCase()}</BAITag>
                  ) as never)
                : undefined,
          }))}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selected,
            onChange: setSelected,
          }}
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
      </BAICardAstryx>
    </div>
  );
};

const App: React.FC = () => {
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return (
    <div className="page">
      <AntdSide dark={dark} />
      <Theme theme={backendAiAdminTheme} mode={dark ? 'dark' : 'light'}>
        <LayerProvider>
          <AstryxSide />
        </LayerProvider>
      </Theme>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
