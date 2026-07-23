/**
 * @generated SignedSource<<04f92d1b7f7018b08e5a0f0d6710b1bd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentAddRevisionModalManualImageQuery$variables = {
  architecture?: string | null | undefined;
  reference: string;
};
export type DeploymentAddRevisionModalManualImageQuery$data = {
  readonly image: {
    readonly id: string | null | undefined;
  } | null | undefined;
};
export type DeploymentAddRevisionModalManualImageQuery = {
  response: DeploymentAddRevisionModalManualImageQuery$data;
  variables: DeploymentAddRevisionModalManualImageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "architecture"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "reference"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "architecture",
        "variableName": "architecture"
      },
      {
        "kind": "Variable",
        "name": "reference",
        "variableName": "reference"
      }
    ],
    "concreteType": "Image",
    "kind": "LinkedField",
    "name": "image",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentAddRevisionModalManualImageQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "DeploymentAddRevisionModalManualImageQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "6bcc84ae2c2ac9e9606dddd37c2b9d15",
    "id": null,
    "metadata": {},
    "name": "DeploymentAddRevisionModalManualImageQuery",
    "operationKind": "query",
    "text": "query DeploymentAddRevisionModalManualImageQuery(\n  $reference: String!\n  $architecture: String\n) {\n  image(reference: $reference, architecture: $architecture) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "9a966eb2f1a961353ecfc61d58978716";

export default node;
