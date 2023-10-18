'use strict';

/**
 Backend AI Painkiller

 `backend-ai-painkiller` informs error messages.

@group Backend.AI Web UI
 @element backend-ai-painkiller
 */
import { get as _text } from 'lit-translate';

declare global {
  interface Window {
    backendaiclient: any;
    backendaiwsproxy: any;
    isElectron: boolean;
    __local_proxy: any;
  }
}

export default class BackendAIPainKiller {
  // DO NOT DELETE t() COMMENT BELOW to keep the translation string
  static errorMessageTable = {
    "Cannot read property 'map' of null": 'error.APINotSupported',
    'TypeError: NetworkError when attempting to fetch resource.':
      'error.NetworkConnectionFailed', //_t('error.NetworkConnectionFailed')
    // Login
    'Login failed. Check login information.': 'error.LoginFailed', //_t('error.LoginFailed')
    'User credential mismatch.': 'error.LoginFailed', //_t('error.LoginFailed')
    'Authentication failed. Check information and manager status.':
      'error.AuthenticationFailed', //_t('error.AuthenticationFailed')
    'Too many failed login attempts': 'error.TooManyLoginFailures', //_t('error.TooManyLoginFailures')
    // virtual folders
    'server responded failure: 400 Bad Request - The virtual folder already exists with the same name.':
      'error.VirtualFolderAlreadyExist', //_t('error.VirtualFolderAlreadyExist')
    '400 Bad Request - The virtual folder already exists with the same name.':
      'error.VirtualFolderAlreadyExist', //_t('error.VirtualFolderAlreadyExist')
    'server responded failure: 400 Bad Request - One of your accessible vfolders already has the name you requested.':
      'error.VirtualFolderAlreadyExist', //_t('error.VirtualFolderAlreadyExist')
    'server responded failure: 400 Bad Request - You cannot create more vfolders.':
      'error.MaximumVfolderCreation', //_t('error.MaximumVfolderCreation')
    'server responded failure: 400 Bad Request - Missing or invalid API parameters. (You cannot create more vfolders.)':
      'error.MaximumVfolderCreation', //_t('error.MaximumVfolderCreation')
    'server responded failure: 400 Bad Request - Cannot change the options of a vfolder that is not owned by myself.':
      'error.CannotChangeVirtualFolderOption', //_t('error.CannotChangeVirtualFolderOption')
    'server responded failure: 403 Forbidden - Cannot share private dot-prefixed vfolders.':
      'error.CannotSharePrivateAutomountFolder', //_t('error.CannotSharePrivateAutomountFolder')
    'server responded failure: 404 Not Found - No such vfolder invitation.':
      'error.FolderSharingNotAvailableToUser', //_t('error.FolderSharingNotAvailableToUser')
    'server responded failure: 404 Not Found - No such user.':
      'error.FolderSharingNotAvailableToUser', //_t('error.FolderSharingNotAvailableToUser')
    // Resource
    'server responded failure: 412 Precondition Failed - You have reached your resource limit.':
      'error.ReachedResourceLimit', //_t('error.ReachedResourceLimit')
    // User
    "Cannot read property 'split' of undefined": 'error.UserHasNoGroup', //_t('error.UserHasNoGroup')
  };
  static regexTable = {
    '\\w*not found matched token with email\\w*': 'error.InvalidSignupToken', //_t('error.InvalidSignupToken')
    '\\w*Access key not found\\w*': 'error.LoginInformationMismatch', //_t('error.LoginInformationMismatch')
    '\\w*401 Unauthorized - Credential/signature mismatch\\w*':
      'error.LoginInformationMismatch', //_t('error.LoginInformationMismatch')
    'integrity error: duplicate key value violates unique constraint "pk_resource_presets"[\\n]DETAIL:  Key \\(name\\)=\\([\\w]+\\) already exists.[\\n]':
      'error.ResourcePolicyAlreadyExist', //_t('error.ResourcePolicyAlreadyExist')
    'integrity error: duplicate key value violates unique constraint "pk_scaling_groups"[\\n]DETAIL:  Key \\(name\\)=\\([\\w]+\\) already exists.[\\n]':
      'error.ScalingGroupAlreadyExist', //_t('error.ScalingGroupAlreadyExist')
    'integrity error: duplicate key value violates unique constraint "uq_users_username"[\\n]DETAIL:  Key \\(username\\)=\\([\\w]+\\) already exists.[\\n]':
      'error.UserNameAlreadyExist', //_t('error.UserNameAlreadyExist')
    'server responded failure: 400 Bad Request - Missing or invalid API parameters. (Your resource quota is exceeded. (cpu=24 mem=512g cuda.shares=80))':
      'error.ResourceLimitExceed', //_t('error.ResourceLimitExceed')
    '\\w*Key \\(name\\)=\\(.+\\) is still referenced from table "keypairs"\\.\\w*':
      'error.ResourcePolicyStillReferenced', //_t('error.ResourcePolicyStillReferenced')
    'Your resource request is smaller than the minimum required by the image. (\\w*)':
      'error.SmallerResourceThenImageRequires', //_t('error.SmallerResourceThenImageRequires')
  };
  public errorMessageTable: any;
  public regexTable: any;

  /**
   * Return error message.
   *
   * @param {string} msg - Original message
   * @return {string} msg - Matched message. If not, return the original one.
   * */
  static relieve(msg) {
    if (typeof msg === 'undefined') {
      if (
        globalThis.backendaiclient === undefined ||
        globalThis.backendaiclient === null
      ) {
        return '_DISCONNECTED';
      } else {
        return 'Problem occurred.';
      }
    }
    // console.log('Error:', msg);
    if (globalThis.backendaiwebui.debug === true) {
      return msg;
    }
    if ({}.hasOwnProperty.call(this.errorMessageTable, msg)) {
      return _text(this.errorMessageTable[msg]);
    } else {
      for (const regex of Object.keys(this.regexTable)) {
        if (RegExp(regex).test(msg)) {
          return _text(this.regexTable[regex]);
        }
      }
      return msg; // Bypass message. It will log on log panel
    }
  }
}
