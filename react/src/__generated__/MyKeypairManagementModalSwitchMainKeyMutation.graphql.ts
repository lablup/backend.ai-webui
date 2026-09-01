/**
 * @generated SignedSource<<e0e84fe017d2f2bc5a8ada8d9f020ed8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SwitchMyMainAccessKeyInput = {
  accessKey: string;
};
export type MyKeypairManagementModalSwitchMainKeyMutation$variables = {
  input: SwitchMyMainAccessKeyInput;
};
export type MyKeypairManagementModalSwitchMainKeyMutation$data = {
  readonly switchMyMainAccessKey: {
    readonly success: boolean;
  } | null | undefined;
};
export type MyKeypairManagementModalSwitchMainKeyMutation = {
  response: MyKeypairManagementModalSwitchMainKeyMutation$data;
  variables: MyKeypairManagementModalSwitchMainKeyMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "SwitchMyMainAccessKeyPayload",
    "kind": "LinkedField",
    "name": "switchMyMainAccessKey",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "success",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "MyKeypairManagementModalSwitchMainKeyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "MyKeypairManagementModalSwitchMainKeyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "b5a021bba8b062981e530dbb99a92dda",
    "id": null,
    "metadata": {},
    "name": "MyKeypairManagementModalSwitchMainKeyMutation",
    "operationKind": "mutation",
    "text": "mutation MyKeypairManagementModalSwitchMainKeyMutation(\n  $input: SwitchMyMainAccessKeyInput!\n) {\n  switchMyMainAccessKey(input: $input) {\n    success\n  }\n}\n"
  }
};
})();

(node as any).hash = "4ade801507a1f52ad2d49575e9cadf4b";

export default node;
