/**
 Backend AI Painkiller

 `backend-ai-painkiller` informs error messages.

 @group Backend.AI Console
 @element backend-ai-painkiller
 */

'use strict';
declare global {
  interface Window {
    backendaiclient: any;
    backendaiwsproxy: any;
    isElectron: boolean;
    __local_proxy: string;
  }
}

import {get as _text} from "lit-translate";

export default class BackendAIPainKiller {
  static errorMessageTable = {
    "Cannot read property 'map' of null": "error.APINotSupported",
    "TypeError: NetworkError when attempting to fetch resource.": "error.NetworkConnectionFailed",
    // Login
    "Login failed. Check login information.": "error.LoginFailed",
    "User credential mismatch.": "error.LoginFailed",
    "Authentication failed. Check information and manager status.": "error.AuthenticationFailed",
    "Too many failed login attempts": "error.TooManyLoginFailures",
    // virtual folders
    "server responded failure: 400 Bad Request - The virtual folder already exists with the same name.": "error.VirtualFolderAlreadyExist",
    "400 Bad Request - The virtual folder already exists with the same name.": "error.VirtualFolderAlreadyExist",
    "server responded failure: 400 Bad Request - You cannot create more vfolders.": "error.MaximumVfolderCreation",
    "server responded failure: 400 Bad Request - Missing or invalid API parameters. (You cannot create more vfolders.)": "error.MaximumVfolderCreation",
    // Resource
    "server responded failure: 412 Precondition Failed - You have reached your resource limit.": "error.ReachedResourceLimit",
    // User
    "Cannot read property 'split' of undefined": "error.UserHasNoGroup",
  };
  static regexTable = {
    '\\w*Access key not found\\w*': "error.LoginInformationMismatch",
    '\\w*401 Unauthorized - Credential/signature mismatch\\w*': "error.LoginInformationMismatch",
    'integrity error: duplicate key value violates unique constraint "pk_resource_presets"[\\n]DETAIL:  Key \\(name\\)=\\([\\w]+\\) already exists.[\\n]': 'error.ResourcePolicyAlreadyExist',
    'integrity error: duplicate key value violates unique constraint "pk_scaling_groups"[\\n]DETAIL:  Key \\(name\\)=\\([\\w]+\\) already exists.[\\n]': 'error.ScalingGroupAlreadyExist',
    'integrity error: duplicate key value violates unique constraint "uq_users_username"[\\n]DETAIL:  Key \\(username\\)=\\([\\w]+\\) already exists.[\\n]': 'error.UserNameAlreadyExist',
    'server responded failure: 400 Bad Request - Missing or invalid API parameters. (Your resource quota is exceeded. (cpu=24 mem=512g cuda.shares=80))': 'error.ResourceLimitExceed',
    'integrity error: update or delete on table "keypair_resource_policies" violates foreign key constraint "fk_keypairs_resource_policy_keypair_resource_policies" on table "keypairs"[\\n]DETAIL:  Key \\(name\\)=\\([\\w]+\\) is still referenced from table "keypairs".[\\n]': 'error.ResourcePolicyStillReferenced',
    'Your resource request is smaller than the minimum required by the image. (\\w*)': 'error.SmallerResourceThenImageRequires',
  };
  public errorMessageTable: any;
  public regexTable: any;

  /**
   * Return error message.
   * */
  static relieve(msg) {
    if (typeof msg === 'undefined') {
      return 'Problem occurred.';
    }
    console.log("Error:", msg);
    if (globalThis.backendaiconsole.debug === true) {
      return msg;
    }
    if (this.errorMessageTable.hasOwnProperty(msg)) {
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
};
