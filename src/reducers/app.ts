/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import {
  UPDATE_DRAWER_STATE,
  UPDATE_OFFLINE,
  UPDATE_PAGE,
} from '../backend-ai-app.js';

const INITIAL_STATE = {
  page: '',
  params: {},
  offline: false,
  drawerOpened: false,
  offlineIndicatorOpened: false,
};

const app = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case UPDATE_PAGE:
      return {
        ...state,
        page: action.page,
        params: action.params,
      };
    case UPDATE_OFFLINE:
      return {
        ...state,
        offline: action.offline,
      };
    case UPDATE_DRAWER_STATE:
      return {
        ...state,
        drawerOpened: action.opened,
      };
    default:
      return state;
  }
};

export default app;
