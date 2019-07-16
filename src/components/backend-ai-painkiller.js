export class BackendAIPainKiller {
    static errorMessageTable = {
        "Cannot read property 'map' of null": "User has no group. Please contact administrator to fix it.",
        "Cannot read property 'split' of undefined": 'Wrong API server address.'
    }

    static relieve(msg) {
        if (BackendAIPainKiller.errorMessageTable.hasOwnProperty(msg)) {
            return BackendAIPainKiller.errorMessageTable[msg];
        } else {
            return msg;
        }
    }
}