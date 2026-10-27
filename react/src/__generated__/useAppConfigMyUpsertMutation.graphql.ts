/**
 * @generated SignedSource<<7bd78c24439af579955db4b88567fbc0>>
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
    "name": "useAppConfigMyUpsertMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useAppConfigMyUpsertMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "b653cb53e4ea61e20164bbb646b81b20",
    "id": null,
    "metadata": {},
    "name": "useAppConfigMyUpsertMutation",
    "operationKind": "mutation",
    "text": "mutation useAppConfigMyUpsertMutation(\n  $input: MyUpsertAppConfigFragmentsInput!\n) {\n  myUpsertAppConfigFragments(input: $input) {\n    items {\n      id\n      configName\n      config\n    }\n    failed {\n      configName\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "28e718646b9b553f87b5bf4ec2f06241";

export default node;
