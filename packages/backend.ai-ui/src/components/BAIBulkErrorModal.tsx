/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAIi18n } from '../hooks/useBAIi18n';
import { theme } from '../theme-shim';
import BAIAlert from './BAIAlert';
import BAIFlex from './BAIFlex';
import BAIModal, { type BAIModalProps } from './BAIModal';
import { BAITable, type BAIColumnsType } from './Table';
import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * to-astryx phase 3 / ticket B: was `import type { AnyObject } from
 * 'antd/es/_util/type'` — a direct antd import for a two-line structural type.
 * Inlined verbatim (antd's own definition) so the modal family carries no antd
 * specifier of its own.
 */

type AnyObject = Record<PropertyKey, any>;

export interface BAIBulkErrorModalProps<RecordType = AnyObject> extends Omit<
  BAIModalProps,
  'children' | 'onOk' | 'onCancel' | 'footer' | 'type'
> {
  /**
   * Column definitions for the failed-request table. Every bulk operation has
   * its own response shape, so the caller describes how one failed request is
   * rendered per row instead of this component hardcoding the columns.
   */
  columns: BAIColumnsType<RecordType>;
  /**
   * One record per failed request. Each record must carry a unique `key`
   * field — the table relies on antd's default row key resolution.
   */
  dataSource: RecordType[];
  /**
   * Optional guidance rendered as the body of a `BAIAlert` above the table
   * (e.g. how to retry), under a fixed localized "Error Occurred" alert
   * title. No default — the caller injects operation-specific copy. Any
   * `ReactNode` works (the underlying antd `Alert.description` accepts one).
   */
  alertDescription?: ReactNode;
  /** Called when the user dismisses the modal (header X, mask, Esc). */
  onRequestClose: () => void;
}

/**
 * Shared modal that surfaces per-request errors of a bulk operation in a
 * table — one row per failed request (FR-3334). Purely informational: it has
 * no footer — dismissal happens through the header X (or mask / Esc) and is
 * reported through the `onRequestClose` convention so the caller decides what
 * happens next (typically keeping its own form open for a retry).
 *
 * The title defaults to a localized "Action execution failed" with an error
 * icon; pass `title` to replace it verbatim with operation-specific copy.
 */
const BAIBulkErrorModal = <RecordType extends AnyObject = AnyObject>({
  columns,
  dataSource,
  alertDescription,
  onRequestClose,
  title,
  ...baiModalProps
}: BAIBulkErrorModalProps<RecordType>) => {
  'use memo';
  const { t } = useBAIi18n();
  const { token } = theme.useToken();

  return (
    <BAIModal
      width={720}
      {...baiModalProps}
      title={
        title ?? (
          <BAIFlex gap="xs" align="center">
            <TriangleAlert color={token.colorError} size="1em" />
            {t('comp:BAIBulkErrorModal.ActionExecutionFailed')}
          </BAIFlex>
        )
      }
      onCancel={() => onRequestClose()}
      // Informational modal — the header X is enough; a footer button would
      // only duplicate it.
      footer={null}
    >
      <BAIFlex direction="column" align="stretch" gap="sm">
        {alertDescription && (
          <BAIAlert
            type="error"
            showIcon
            title={t('comp:BAIBulkErrorModal.ErrorOccurred')}
            description={alertDescription}
          />
        )}
        <BAITable<RecordType>
          scroll={{ x: 'max-content' }}
          columns={columns}
          dataSource={dataSource}
          // Client-side pagination: 10 rows per page, hidden entirely while
          // the failures fit on a single page.
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            hideOnSinglePage: true,
          }}
          resizable={false}
          size="small"
          bordered
        />
      </BAIFlex>
    </BAIModal>
  );
};

export default BAIBulkErrorModal;
