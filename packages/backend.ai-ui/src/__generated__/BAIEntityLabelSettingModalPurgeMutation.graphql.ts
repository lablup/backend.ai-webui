/**
 * @generated SignedSource<<806139597bcd7b7608facabbf5c91b4f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIEntityLabelSettingModalPurgeMutation$variables = {
  id: string;
};
export type BAIEntityLabelSettingModalPurgeMutation$data = {
  readonly purgeEntityLabel: {
    readonly label: {
      readonly id: string;
    };
  } | null | undefined;
};
export type BAIEntityLabelSettingModalPurgeMutation = {
  response: BAIEntityLabelSettingModalPurgeMutation$data;
  variables: BAIEntityLabelSettingModalPurgeMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "PurgeEntityLabelPayload",
    "kind": "LinkedField",
    "name": "purgeEntityLabel",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "EntityLabel",
        "kind": "LinkedField",
        "name": "label",
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
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIEntityLabelSettingModalPurgeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIEntityLabelSettingModalPurgeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "47ed78322652605065c2d3dcdbf3c218",
    "id": null,
    "metadata": {},
    "name": "BAIEntityLabelSettingModalPurgeMutation",
    "operationKind": "mutation",
    "text": "mutation BAIEntityLabelSettingModalPurgeMutation(\n  $id: ID!\n) {\n  purgeEntityLabel(id: $id) {\n    label {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c93e7e020084a6984e4d7ea3bc8f559c";

export default node;
