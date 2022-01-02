/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */
export const UPDATE_PAGE = 'UPDATE_PAGE';
export const UPDATE_OFFLINE = 'UPDATE_OFFLINE';
export const UPDATE_DRAWER_STATE = 'UPDATE_DRAWER_STATE';
export const OPEN_SNACKBAR = 'OPEN_SNACKBAR';
export const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR';

export const navigate = (path: any, params: Record<string, unknown> = {}) => (dispatch: any) => {
  // Extract the page name from path.
  if (['/summary', '/job', '/pipeline', '/experiment', '/data', '/statistics', '/usersettings',
    '/agent', '/resource', '/user', '/credential', '/environment', '/settings',
    '/maintenance', '/information', '/github', '/import'].includes(path) !== true) { // Fallback for Electron Shell/Windows OS
    const fragments = path.split(/[/]+/);
    if (fragments.length > 1 && fragments[0] === '') {
      path = fragments[1];
      params['requestURL'] = fragments.slice(2).join('/');
    }
  }
  params['queryString'] = window.location.search;
  if (path === 'index.html' || path === '') {
    path = '/';
  }
  let page;
  if (['/', 'build', '/build', 'app', '/app'].includes(path)) {
    page = 'summary';
  } else if (path[0] === '/') {
    page = path.slice(1);
  } else {
    page = path;
  }

  // const page = path === '/' ? 'summary' : path.slice(1);
  // Any other info you might want to extract from the path (like page type),
  // you can do here
  if (['agent', 'resource', 'user', 'credential', 'environment', 'settings',
    'maintenance', 'information'].includes(page)) {
    // page = 'summary';
    // globalThis.history.pushState({}, '', '/summary');
  }
  dispatch(loadPage(page, params));

  // Close the drawer - in case the *path* change came from a link in the drawer.
  dispatch(updateDrawerState(false));
};

const loadPage = (page, params: Record<string, unknown> = {}) => (dispatch) => {
  switch (page) {
  case 'summary':
    import('./components/backend-ai-summary-view.js').then((module) => {
      // TODO: after page changing?
    });
    break;
  case 'job':
    import('./components/backend-ai-session-view.js');
    break;
  case 'pipeline':
    import('./components/backend-ai-pipeline-view.js');
    break;
    /* case 'experiment':
      import('./components/backend-ai-experiment-view.js');
      break; */
  case 'data':
    import('./components/backend-ai-data-view.js');
    break;
  case 'usersettings':
    import('./components/backend-ai-usersettings-view.js');
    break;
  case 'agent':
  case 'resource':
    import('./components/backend-ai-agent-view.js');
    break;
  case 'credential':
  case 'user':
    import('./components/backend-ai-credential-view.js');
    break;
  case 'environment':
    import('./components/backend-ai-environment-view.js');
    break;
  case 'settings':
    import('./components/backend-ai-settings-view.js');
    break;
  case 'maintenance':
    import('./components/backend-ai-maintenance-view.js');
    break;
  case 'information':
    import('./components/backend-ai-information-view.js');
    break;
  case 'statistics':
    import('./components/backend-ai-statistics-view.js');
    break;
  case 'verify-email':
    import('./components/backend-ai-email-verification-view.js');
    break;
  case 'change-password':
    import('./components/backend-ai-change-forgot-password-view.js');
    break;
  case 'github':
  case 'gitlab':
  case 'import':
    import('./components/backend-ai-import-view.js');
    break;
  case 'edu-applauncher':
    import('./components/backend-ai-edu-applauncher.js');
    break;
  case 'unauthorized':
    import('./components/backend-ai-permission-denied-view.js');
    break;
  case 'error':
  default:
    if (typeof globalThis.backendaiPages !== 'undefined') {
      for (const item of globalThis.backendaiPages) {
        if ('url' in item) {
          import('./plugins/' + item.url + '.js');
        }
      }
      break;
    } else {
      document.addEventListener('backend-ai-plugin-loaded', () => {
        return;
      });
    }
    import('./components/backend-ai-error-view.js').then((module) => {
      return;
    });
    break;
  }
  dispatch(updatePage(page, params));
};

const updatePage = (page, params) => {
  return {
    type: UPDATE_PAGE,
    page,
    params
  };
};

let offlineTimer;

export const showOffline = () => (dispatch) => {
  dispatch({
    type: OPEN_SNACKBAR
  });
  window.clearTimeout(offlineTimer);
  offlineTimer = window.setTimeout(() =>
    dispatch({type: CLOSE_SNACKBAR}), 3000);
};

export const updateOffline = (offline) => (dispatch, getState) => {
  // Show the snackbar only if offline status changes.
  if (offline !== getState().app.offline) {
    dispatch(showOffline());
  }
  dispatch({
    type: UPDATE_OFFLINE,
    offline
  });
};

export const updateDrawerState = (opened) => {
  return {
    type: UPDATE_DRAWER_STATE,
    opened
  };
};
