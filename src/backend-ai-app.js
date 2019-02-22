export const UPDATE_PAGE = 'UPDATE_PAGE';
export const UPDATE_OFFLINE = 'UPDATE_OFFLINE';
export const UPDATE_DRAWER_STATE = 'UPDATE_DRAWER_STATE';
export const OPEN_OFFLINE_INDICATOR = 'OPEN_OFFLINE_INDICATOR';
export const CLOSE_OFFLINE_INDICATOR = 'CLOSE_OFFLINE_INDICATOR';

export const navigate = (path) => (dispatch) => {
  // Extract the page name from path.
  if (['/summary', '/job', '/agent', '/credential', '/data'].includes(path) != true) { // Fallback for Electron Shell/Windows OS
    path = path.split(/[\/]+/).pop();
  }
  if (path === 'index.html' || path === '') {
    path = '/';
  }
  const page = path === '/' ? 'summary' : path.slice(1);
  // Any other info you might want to extract from the path (like page type),
  // you can do here
  dispatch(loadPage(page));

  // Close the drawer - in case the *path* change came from a link in the drawer.
  dispatch(updateDrawerState(false));
};

const loadPage = (page) => (dispatch) => {
  let view = page;
  switch (page) {
    case 'summary':
      import('./backend-ai-summary-view.js').then((module) => {
        // Put code in here that you want to run every time when
        // navigating to view1 after my-view1.js is loaded.
      });
      break;
    case 'job':
      import('./backend-ai-job-view.js');
      break;
    case 'credential':
      import('./backend-ai-credential-view.js');
      break;
    case 'data':
      import('./backend-ai-data-view.js');
      break;
    case 'agent':
      import('./backend-ai-agent-view.js');
      break;
    default:
      import('./backend-ai-summary-view.js').then((module) => {
      });
      break;
  }

  dispatch(updatePage(page));
};

const updatePage = (page) => {
  return {
    type: UPDATE_PAGE,
    page
  };
};

let offlineTimer;

export const showOffline = () => (dispatch) => {
  dispatch({
    type: OPEN_OFFLINE_INDICATOR
  });
  window.clearTimeout(offlineTimer);
  offlineTimer = window.setTimeout(() =>
    dispatch({type: CLOSE_OFFLINE_INDICATOR}), 3000);
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
