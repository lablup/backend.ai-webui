/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/* TabCounter.ts
 * Based on TabCounter.js by Shubanker Chourasia
 * License: MIT
 * https://github.com/shubanker/Tabs-Counter
 *
 * TypeScript version for React consumption.
 */
import { generateUUID } from '../helper/uuid';

interface TabData {
  url?: string;
  lastActive: number;
  TabOpenedTimeStamp?: number;
}

interface TabCountData {
  list: Record<string, TabData>;
  lastCleaned: number;
}

class TabCount {
  updateInterval = 1000;
  tabId = generateUUID();
  tabsCounter = 0;
  onTabCountUpdate: Array<(count: number) => void> = [];
  updateActiveInterval: ReturnType<typeof setInterval> | 0 = 0;

  constructor() {
    this.updateActive();
    this.start();
    globalThis.addEventListener('beforeunload', () => {
      const data = this.getData();
      delete data.list[this.tabId];
      this.updateData(data);
    });
  }

  tabsCount = (skipCallback = true): number => {
    const data = this.getData();
    const listIds = Object.keys(data.list);
    const now = Date.now();
    let count = 0;
    listIds.forEach((id) => {
      if (data.list[id].lastActive + this.updateInterval * 1.2 > now) {
        count++;
      }
    });
    if (!skipCallback && this.tabsCounter !== count) {
      this.onTabCountUpdate.forEach((event) => {
        event(count);
      });
    }
    return (this.tabsCounter = count);
  };

  updateActive = (): void => {
    let data = this.getData();
    const now = Date.now();
    if (data.list[this.tabId] === undefined) {
      data.list[this.tabId] = {
        TabOpenedTimeStamp: now,
        lastActive: now,
      };
    }
    data.list[this.tabId].url = globalThis.location.href;
    data.list[this.tabId].lastActive = now;
    if (undefined === data.lastCleaned || +data.lastCleaned + 20000 < now) {
      data = this.clearList(data);
    }
    this.updateData(data);
    this.tabsCount(false);
  };

  clearList = (data: TabCountData): TabCountData => {
    const listIds = Object.keys(data.list);
    const now = Date.now();
    listIds.forEach((id) => {
      if (
        data.list[id].lastActive + Math.max(8000, this.updateInterval * 1.5) <
        now
      ) {
        delete data.list[id];
      }
    });
    data.lastCleaned = now;
    return data;
  };

  onTabChange = (
    callback: (count: number) => void,
    executeNow = false,
  ): void => {
    if (typeof callback === 'function') {
      this.onTabCountUpdate.push(callback);
      if (executeNow) {
        callback(this.tabsCount());
      }
    }
  };

  updateData = (data: TabCountData | string): void => {
    localStorage.setItem(
      'tabCountData',
      typeof data === 'string' ? data : JSON.stringify(data),
    );
  };

  getData = (): TabCountData => {
    const savedData = localStorage.getItem('tabCountData');
    if (savedData == null) {
      return { list: {}, lastCleaned: 0 };
    }
    try {
      return JSON.parse(savedData) as TabCountData;
    } catch {
      return { list: {}, lastCleaned: 0 };
    }
  };

  getUrls = (getUnique = false): string[] => {
    const data = this.getData();
    const urlList: string[] = [];
    Object.keys(data.list).forEach((lt) => {
      if (!getUnique || urlList.indexOf(data.list[lt].url ?? '') === -1) {
        urlList.push(data.list[lt].url ?? '');
      }
    });
    return urlList;
  };

  setUpdateInterval = (interval = this.updateInterval): void => {
    if (this.updateActiveInterval !== 0) {
      this.pause();
    }
    this.start(interval);
  };

  pause = (): void => {
    if (this.updateActiveInterval !== 0) {
      clearInterval(this.updateActiveInterval);
    }
    this.updateActiveInterval = 0;
  };

  start = (interval = this.updateInterval): void => {
    this.updateActiveInterval = setInterval(
      () => {
        this.updateActive();
      },
      (this.updateInterval = interval),
    );
  };
}

export default TabCount;
