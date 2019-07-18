'use strict';

class BackendAIPainKiller {
  constructor() {
    this.errorMessageTable = {
      "Cannot read property 'map' of null": "User has no group. Please contact administrator to fix it.",
      "Cannot read property 'split' of undefined": 'Wrong API server address.',
      "server responded failure: 400 Bad Request - The virtual folder already exists with the same name.": "A virtual folder with the same name already exists. Delete your own folder or decline the invitation."
    };
  }

  static relieve(msg) {
    if (this.errorMessageTable.hasOwnProperty(msg)) {
      return this.errorMessageTable[msg];
    } else {
      return msg;
    }
  }
}

export default BackendAIPainKiller;
