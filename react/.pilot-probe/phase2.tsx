/**
 * PILOT 10 PHASE 2 — isolation harness for the REAL local Astryx components.
 *
 * Unlike phase 1 (which re-created the JSX shapes), this imports the actual
 * `react/src/components/astryx-bui/*` modules the page now renders, and puts
 * them next to the antd originals they replaced.
 */
import './probe.css';
import BAIButtonAstryx from '../src/components/astryx-bui/BAIButtonAstryx';
import BAICardAstryx from '../src/components/astryx-bui/BAICardAstryx';
import BAIFlexAstryx from '../src/components/astryx-bui/BAIFlexAstryx';
import BAIModalAstryx from '../src/components/astryx-bui/BAIModalAstryx';
import BAITableAstryx from '../src/components/astryx-bui/BAITableAstryx';
import { BAITag } from '../src/components/astryx-bui/smallPrimitives';
import {
  Button,
  Card,
  ConfigProvider,
  Modal,
  Table,
  Tag,
  theme,
} from 'antd';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

const ORANGE = '#ff7a00';

interface Row extends Record<string, unknown> {
  id: string;
  name: string;
  status: string;
  host: string;
  ownership_type: string;
  cur_size: string;
}

const ROWS: Array<Row> = [
  {
    id: '1',
    name: 'my-training-data',
    status: 'ready',
    host: 'local:volume1',
    ownership_type: 'user',
    cur_size: '12.4 GB',
  },
  {
    id: '2',
    name: 'shared-models',
    status: 'mounted',
    host: 'ceph:fast',
    ownership_type: 'group',
    cur_size: '304 GB',
  },
  {
    id: '3',
    name: '.automount-config',
    status: 'error',
    host: 'local:volume1',
    ownership_type: 'user',
    cur_size: '2 MB',
  },
];

const COLUMNS = [
  { key: 'name', title: 'Name', dataIndex: 'name', required: true, sorter: true },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    sorter: true,
  },
  { key: 'host', title: 'Location', dataIndex: 'host', sorter: true },
  {
    key: 'ownership_type',
    title: 'Type',
    dataIndex: 'ownership_type',
    sorter: true,
  },
  { key: 'cur_size', title: 'Folder usage', dataIndex: 'cur_size' },
];

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="section">
    <div className="section-title">{title}</div>
    <div className="section-body">{children}</div>
  </div>
);

const AntdSide: React.FC<{ dark: boolean }> = ({ dark }) => {
  const [selected, setSelected] = useState<Array<React.Key>>(['2']);
  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: ORANGE },
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div className="col">
        <div className="col-head">antd 6 — BEFORE</div>
        <Section title="BAICard + BAIButton (extra slot)">
          <Card
            title="Folders"
            variant="borderless"
            extra={
              <Button type="primary" size="middle">
                Create folder
              </Button>
            }
            styles={{ body: { paddingTop: 0 } }}
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
              pagination={{ pageSize: 10, current: 1, total: 3 }}
            />
          </Card>
        </Section>
        <Section title="BAIModal (closed in this shot)">
          <Modal
            open={false}
            getContainer={false}
            title="Move to trash"
            okText="Confirm"
            okButtonProps={{ danger: true }}
            mask={false}
            width={420}
          >
            Move 3 folders to the trash bin?
          </Modal>
        </Section>
      </div>
    </ConfigProvider>
  );
};

const AstryxSide: React.FC = () => {
  const [selected, setSelected] = useState<Array<React.Key>>(['2']);
  const [order, setOrder] = useState<string | null>('-name');
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className="col">
      <div className="col-head">Astryx — AFTER</div>
      <Section title="BAICardAstryx + BAIButtonAstryx (extra slot)">
        <BAICardAstryx
          title="Folders"
          variant="borderless"
          extra={
            <BAIFlexAstryx gap="xs" align="center">
              <BAIButtonAstryx type="primary">Create folder</BAIButtonAstryx>
            </BAIFlexAstryx>
          }
        >
          <BAITableAstryx<Row>
            size="small"
            rowKey={(r) => r.id}
            dataSource={ROWS}
            order={order}
            onChangeOrder={(next) => setOrder(next ?? null)}
            columns={COLUMNS.map((c) => ({
              ...c,
              render:
                c.key === 'status'
                  ? ((v: never) => (
                      <BAITag color="warning">
                        {String(v).toUpperCase()}
                      </BAITag>
                    ) as never)
                  : undefined,
            }))}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selected,
              onChange: setSelected,
            }}
            pagination={{ pageSize: 10, current: 1, total: 3 }}
          />
        </BAICardAstryx>
      </Section>
      <Section title="BAIModalAstryx (Dialog + Layout slots)">
        <BAIButtonAstryx onClick={() => setModalOpen(true)}>
          Open modal
        </BAIButtonAstryx>
        <BAIModalAstryx
          open={modalOpen}
          title="Move to trash"
          okText="Confirm"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          width={420}
          onCancel={() => setModalOpen(false)}
          onOk={() => setModalOpen(false)}
        >
          Move 3 folders to the trash bin?
        </BAIModalAstryx>
      </Section>
    </div>
  );
};

const App: React.FC = () => {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return (
    <div className="page">
      <AntdSide dark={dark} />
      <AstryxSide />
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
