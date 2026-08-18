/**
 * @generated SignedSource<<9c5163937849392755bbb2acd7b0a682>>
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
export type useBAIAppConfigMyUpsertMutation$variables = {
  input: MyUpsertAppConfigFragmentsInput;
};
export type useBAIAppConfigMyUpsertMutation$data = {
  readonly myUpsertAppConfigFragments: {
    readonly failed: ReadonlyArray<{
      readonly configName: string;
      readonly message: string;
    }>;
    readonly items: ReadonlyArray<{
      readonly config: any;
      readonly configName: string;
      readonly id: string;
    }>;
  };
};
export type useBAIAppConfigMyUpsertMutation = {
  response: useBAIAppConfigMyUpsertMutation$data;
  variables: useBAIAppConfigMyUpsertMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "configName",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "UpsertAppConfigFragmentsPayload",
    "kind": "LinkedField",
    "name": "myUpsertAppConfigFragments",
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
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "config",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "AppConfigFragmentUpsertError",
        "kind": "LinkedField",
        "name": "failed",
        "plural": true,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "message",
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
    "name": "useBAIAppConfigMyUpsertMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useBAIAppConfigMyUpsertMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "3eaa794206ca51afa10253cc4fc6fdfe",
    "id": null,
    "metadata": {},
    "name": "useBAIAppConfigMyUpsertMutation",
    "operationKind": "mutation",
    "text": "mutation useBAIAppConfigMyUpsertMutation(\n  $input: MyUpsertAppConfigFragmentsInput!\n) {\n  myUpsertAppConfigFragments(input: $input) {\n    items {\n      id\n      configName\n      config\n    }\n    failed {\n      configName\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2fb2d13c6c13d5d6abee7d322c00c782";

export default node;
