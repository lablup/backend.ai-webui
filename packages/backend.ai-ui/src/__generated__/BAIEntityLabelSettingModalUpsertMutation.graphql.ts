/**
 * @generated SignedSource<<90697df7adf3f19c3f4682f455df4765>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpsertEntityLabelInput = {
  key: string;
  target: EntityTarget;
  value: string;
};
export type EntityTarget = {
  entityId: string;
  entityType: string;
};
export type BAIEntityLabelSettingModalUpsertMutation$variables = {
  input: UpsertEntityLabelInput;
};
export type BAIEntityLabelSettingModalUpsertMutation$data = {
  readonly upsertEntityLabel: {
    readonly label: {
      readonly id: string;
      readonly key: string;
      readonly value: string;
    };
  } | null | undefined;
};
export type BAIEntityLabelSettingModalUpsertMutation = {
  response: BAIEntityLabelSettingModalUpsertMutation$data;
  variables: BAIEntityLabelSettingModalUpsertMutation$variables;
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
    "concreteType": "UpsertEntityLabelPayload",
    "kind": "LinkedField",
    "name": "upsertEntityLabel",
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "key",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "value",
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
    "name": "BAIEntityLabelSettingModalUpsertMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIEntityLabelSettingModalUpsertMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9f188a0b7bf79681195242b07530114e",
    "id": null,
    "metadata": {},
    "name": "BAIEntityLabelSettingModalUpsertMutation",
    "operationKind": "mutation",
    "text": "mutation BAIEntityLabelSettingModalUpsertMutation(\n  $input: UpsertEntityLabelInput!\n) {\n  upsertEntityLabel(input: $input) {\n    label {\n      id\n      key\n      value\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d680e9e0d05c83b65b09a5d5ca6c4542";

export default node;
