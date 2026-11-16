/**
 * @generated SignedSource<<8964e9513d455fc402c52cf4130a8b8d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type MyUpsertAppConfigFragmentsInput = {
  items: ReadonlyArray<AppConfigFragmentUpsertItem>;
};
export type AppConfigFragmentUpsertItem = {
  config: any;
  configName: string;
};
export type useAppConfigMyUpsertMutation$variables = {
  input: MyUpsertAppConfigFragmentsInput;
};
export type useAppConfigMyUpsertMutation$data = {
  readonly myAtomicBulkUpsertAppConfigFragments: {
    readonly items: ReadonlyArray<{
      readonly config: any;
      readonly configName: string;
      readonly id: string;
    }>;
  };
};
export type useAppConfigMyUpsertMutation = {
  response: useAppConfigMyUpsertMutation$data;
  variables: useAppConfigMyUpsertMutation$variables;
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
    "concreteType": "AtomicBulkUpsertAppConfigFragmentsPayload",
    "kind": "LinkedField",
    "name": "myAtomicBulkUpsertAppConfigFragments",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "AppConfigFragment",
        "kind": "LinkedField",
        "name": "items",
        "plural": true,
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
            "name": "configName",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "config",
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
    "name": "useAppConfigMyUpsertMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useAppConfigMyUpsertMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "1b38df03b9587c117cbdfdc30df340dd",
    "id": null,
    "metadata": {},
    "name": "useAppConfigMyUpsertMutation",
    "operationKind": "mutation",
    "text": "mutation useAppConfigMyUpsertMutation(\n  $input: MyUpsertAppConfigFragmentsInput!\n) {\n  myAtomicBulkUpsertAppConfigFragments(input: $input) {\n    items {\n      id\n      configName\n      config\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "bb1b7330394f783ac0e8bcbf28f6d73d";

export default node;
