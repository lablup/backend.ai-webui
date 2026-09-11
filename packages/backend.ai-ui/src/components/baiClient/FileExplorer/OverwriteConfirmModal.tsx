/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Per-entry overwrite decision for an upload whose names collide with what is
 already in the target directory (FR-1564). Unchecked rows are dropped from the
 pick; entries with a free name upload either way and are only counted here.
*/
import { convertToDecimalUnit } from '../../../helper';
import { useBAIi18n } from '../../../hooks/useBAIi18n';
import BAIFlex from '../../BAIFlex';
import BAIModal, { type BAIModalProps } from '../../BAIModal';
import { BAIColumnsType, BAITable } from '../../Table';
import type { DuplicatedUploadEntry } from './hooks';
import { Text } from '@astryxdesign/core/Text';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { File, Folder } from 'lucide-react';
import { useState } from 'react';

export interface OverwriteConfirmModalProps extends BAIModalProps {
  duplicatedEntries: Array<DuplicatedUploadEntry>;
  /** Entries in the same pick whose names are free. */
  newEntryCount: number;
  onRequestClose: (success: boolean, overwritingNames?: Array<string>) => void;
}

const formatSize = (size: number) =>
  size > 0 ? (convertToDecimalUnit(size, 'auto')?.displayValue ?? '-') : '-';

const ItemInfo: React.FC<{ size: number; time: string | number }> = ({
  size,
  time,
}) => (
  <BAIFlex direction="column" align="start">
    <Text>{formatSize(size)}</Text>
    <Text size="sm" color="secondary">
      {dayjs(time).format('lll')}
    </Text>
  </BAIFlex>
);

const OverwriteConfirmModal: React.FC<OverwriteConfirmModalProps> = ({
  duplicatedEntries,
  newEntryCount,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const [overwritingNames, setOverwritingNames] = useState<Array<string>>(() =>
    _.map(duplicatedEntries, 'name'),
  );

  const columns: BAIColumnsType<DuplicatedUploadEntry> = [
    {
      title: t('comp:FileExplorer.Name'),
      dataIndex: 'name',
      render: (name: string, record) => (
        <BAIFlex gap="xs" style={{ display: 'inline-flex' }}>
          {record.isDirectory ? <Folder size="1em" /> : <File size="1em" />}
          <Text maxLines={1}>{name}</Text>
        </BAIFlex>
      ),
    },
    {
      title: t('comp:FileExplorer.ExistingItem'),
      dataIndex: 'existingItem',
      render: (_existingItem, record) => (
        <ItemInfo
          size={record.existingItem.size}
          time={record.existingItem.modified}
        />
      ),
    },
    {
      title: t('comp:FileExplorer.UploadingItem'),
      dataIndex: 'files',
      render: (_files, record) => (
        <ItemInfo
          size={_.sumBy(record.files, 'size')}
          time={_.max(_.map(record.files, 'lastModified')) ?? 0}
        />
      ),
    },
  ];

  return (
    <BAIModal
      title={t('comp:FileExplorer.DuplicatedFiles')}
      okText={t('general.button.Upload')}
      okButtonProps={{
        disabled: _.isEmpty(overwritingNames) && newEntryCount === 0,
      }}
      onOk={() => onRequestClose(true, overwritingNames)}
      onCancel={() => onRequestClose(false)}
      width={640}
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="sm">
        <Text>{t('comp:FileExplorer.SelectItemsToOverwrite')}</Text>
        <BAITable
          rowKey="name"
          dataSource={duplicatedEntries}
          columns={columns}
          pagination={false}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: overwritingNames,
            onChange: (selectedRowKeys) =>
              setOverwritingNames(_.map(selectedRowKeys, String)),
          }}
        />
        {newEntryCount > 0 ? (
          <Text size="sm" color="secondary">
            {t('comp:FileExplorer.OtherItemsWillBeUploaded', {
              count: newEntryCount,
            })}
          </Text>
        ) : null}
      </BAIFlex>
    </BAIModal>
  );
};

export default OverwriteConfirmModal;
