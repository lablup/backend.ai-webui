/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/* TabCounter.ts
 * TypeScript port for React usage.
 * Original author: Shubanker Chourasia (MIT license)
 * https://github.com/shubanker/Tabs-Counter
 */

interface TabData {
  list: Record<
    string,
    {
      TabOpenedTimeStamp?: number;
      url?: string;
      lastActive: number;
    }
  >;
  lastCleaned: number;
}

class TabCount {
  updateInterval = 1000;
  tabId = Math.random().toString(36).substring(7);
  tabsCounter = 0;
  private onTabCountUpdate: Array<(count: number) => void> = [];
  private updateActiveInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.updateActive();
    this.start();
    window.addEventListener('beforeunload', () => {
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
    this.tabsCounter = count;
    return count;
  };

  private updateActive = (): void => {
    let data = this.getData();
    const now = Date.now();
    if (data.list[this.tabId] === undefined) {
      data.list[this.tabId] = {
        TabOpenedTimeStamp: now,
        lastActive: now,
      };
    }
    data.list[this.tabId].url = window.location.href;
    data.list[this.tabId].lastActive = now;
    if (data.lastCleaned === undefined || +data.lastCleaned + 20000 < now) {
      data = this.clearList(data);
    }
    this.updateData(data);
    this.tabsCount(false);
  };

  private clearList = (data: TabData): TabData => {
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

  private updateData = (data: TabData): void => {
    localStorage.setItem('tabCountData', JSON.stringify(data));
  };

  private getData = (): TabData => {
    const savedData = localStorage.getItem('tabCountData');
    return savedData == null
      ? { list: {}, lastCleaned: 0 }
      : JSON.parse(savedData);
  };

  pause = (): void => {
    if (this.updateActiveInterval !== null) {
      clearInterval(this.updateActiveInterval);
      this.updateActiveInterval = null;
    }
  };

  start = (interval?: number): void => {
    if (interval !== undefined) {
      this.updateInterval = interval;
    }
    this.updateActiveInterval = setInterval(() => {
      this.updateActive();
    }, this.updateInterval);
  };
}

export default TabCount;
