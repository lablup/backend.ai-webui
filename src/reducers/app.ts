/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */

import {CLOSE_SNACKBAR, OPEN_SNACKBAR, UPDATE_DRAWER_STATE, UPDATE_OFFLINE, UPDATE_PAGE} from '../backend-ai-app.js';

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
      params: action.params
    };
  case UPDATE_OFFLINE:
    return {
      ...state,
      offline: action.offline
    };
  case UPDATE_DRAWER_STATE:
    return {
      ...state,
      drawerOpened: action.opened
    };
  case OPEN_SNACKBAR:
    return {
      ...state,
      offlineIndicatorOpened: true
    };
  case CLOSE_SNACKBAR:
    return {
      ...state,
      offlineIndicatorOpened: false
    };
  default:
    return state;
  }
};

export default app;
