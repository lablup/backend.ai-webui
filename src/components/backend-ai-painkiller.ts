'use strict';
declare global {
  interface Window {
    backendaiclient: any;
    backendaiwsproxy: any;
    isElectron: boolean;
    __local_proxy: string;
  }
}

var BackendAIPainKiller = (()=>{
  return class {
    public errorMessageTable: any;
    public regexTable: any;
    static relieve(msg) {
      if (window.backendaiconsole.debug === true) {
        return msg;
      }
      if (this.errorMessageTable.hasOwnProperty(msg)) {
        return this.errorMessageTable[msg];
      } else {
        for (const regex of Object.keys(this.regexTable)) {
          if (RegExp(regex).test(msg)) return this.regexTable[regex];
        }
        return 'Problem found during process.';
      }
    }
  };
})();

BackendAIPainKiller.errorMessageTable = {
      "Cannot read property 'map' of null": "User has no group. Please contact administrator to fix it.",
      "Cannot read property 'split' of undefined": 'Wrong API server address.',
      "server responded failure: 400 Bad Request - The virtual folder already exists with the same name.": "A virtual folder with the same name already exists. Delete your own folder or decline the invitation.",
      "server responded failure: 400 Bad Request - Missing or invalid API parameters. (You cannot create more vfolders.)": "You cannot create more vfolders due to resource policy",
    };

BackendAIPainKiller.regexTable = {
  'integrity error: duplicate key value violates unique constraint "pk_resource_presets"[\\n]DETAIL:  Key \\(name\\)=\\([\\w]+\\) already exists.[\\n]': 'A resource policy with the same name already exists.'
};

export default BackendAIPainKiller;
