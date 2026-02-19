/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */

// Redux action type constants - kept for backward compatibility with reducers
export const UPDATE_PAGE = 'UPDATE_PAGE';
export const UPDATE_OFFLINE = 'UPDATE_OFFLINE';
export const UPDATE_DRAWER_STATE = 'UPDATE_DRAWER_STATE';

// Navigation is now handled by React Router.
// The navigate() Redux action is no longer needed.
// Use React Router's useNavigate() hook or dispatch 'react-navigate' event instead.

export const updateDrawerState = (opened) => {
  return { type: UPDATE_DRAWER_STATE, opened };
};
