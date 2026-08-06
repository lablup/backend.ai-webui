/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 6 (cn-oss-removal / ticket 10, item 4/5) — `BAIListAlert`.

 Found by the FINAL SWEEP, not by the plan: the earlier phases' residue lists
 said the delete/restore modals were antd-free, because the grep only looked at
 `react/src` files. `DeleteVFolderModal` imports `BAIListAlert` from BUI, which
 wraps `BAIAlert` (antd `Alert`) and adds an `antd-style` scrollbar block. The
 lesson is in the report: **a per-file antd grep understates the residue; the
 sweep has to follow the BUI imports one hop further.**

 Rebuild: Astryx `Banner status="info"` with the same `<ul>` in `description`.
 The transparent-scrollbar rules move to `astryxBui.css` with Astryx theme vars
 (`--color-text-tertiary`), so they follow brand / admin themes and both colour
 schemes — the antd version read `token.colorTextQuaternary`.

 **Native** rebuild: the only pilot-graph consumer is `DeleteVFolderModal`.
 BUI's original stays for `UpdateUsersModal` / `UpdateResourceGroupsModal`.
*/
import './astryxBui.css';
import { Banner } from '@astryxdesign/core/Banner';
import * as _ from 'lodash-es';
import React from 'react';

export interface BAIListAlertAstryxItem {
  key?: React.Key | null;
  content: React.ReactNode;
}

export interface BAIListAlertAstryxProps {
  title: React.ReactNode;
  items: Array<BAIListAlertAstryxItem>;
  /** Astryx `BannerStatus`; the closed set is info/warning/error/success. */
  status?: 'info' | 'warning' | 'error' | 'success';
  /** ~7 rows, inherited from the BUI original. */
  maxHeight?: React.CSSProperties['maxHeight'];
}

const BAIListAlertAstryx: React.FC<BAIListAlertAstryxProps> = ({
  title,
  items,
  status = 'info',
  maxHeight = 165,
}) => {
  'use memo';
  return (
    <Banner
      status={status}
      title={title}
      container="section"
      description={
        _.isEmpty(items) ? undefined : (
          <ul
            // Keep the scrollable region reachable by keyboard (BUI parity).
            tabIndex={0}
            className="bai-list-alert-scroll"
            style={{
              margin: 0,
              padding: 0,
              paddingTop: 4,
              listStyle: 'circle',
              listStylePosition: 'inside',
              maxHeight,
              overflowY: 'auto',
            }}
          >
            {_.map(items, (item, index) => (
              <li key={item.key ?? `__index-${index}`}>{item.content}</li>
            ))}
          </ul>
        )
      }
    />
  );
};

export default BAIListAlertAstryx;
