/**
 * @generated SignedSource<<8d0b5cf46cc368943bb6b6d66ae8f45f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AppConfigScopeType = "DOMAIN" | "PUBLIC" | "USER" | "%future added value";
export type ScopedUpsertAppConfigFragmentsInput = {
  items: ReadonlyArray<AppConfigFragmentUpsertItem>;
  scope: AppConfigScopeRef;
};
export type AppConfigScopeRef = {
  scopeId?: string | null | undefined;
  scopeType: AppConfigScopeType;
};
export type AppConfigFragmentUpsertItem = {
  config: any;
  configName: string;
};
export type useAppConfigUpsertMutation$variables = {
  input: ScopedUpsertAppConfigFragmentsInput;
};
export type useAppConfigUpsertMutation$data = {
  readonly scopedUpsertAppConfigFragments: {
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
export type useAppConfigUpsertMutation = {
  response: useAppConfigUpsertMutation$data;
  variables: useAppConfigUpsertMutation$variables;
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
    "name": "scopedUpsertAppConfigFragments",
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
    "name": "useAppConfigUpsertMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useAppConfigUpsertMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "f64bce4d5e64afa323f4c2df8723e33b",
    "id": null,
    "metadata": {},
    "name": "useAppConfigUpsertMutation",
    "operationKind": "mutation",
    "text": "mutation useAppConfigUpsertMutation(\n  $input: ScopedUpsertAppConfigFragmentsInput!\n) {\n  scopedUpsertAppConfigFragments(input: $input) {\n    items {\n      id\n      configName\n      config\n    }\n    failed {\n      configName\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a65ed37203037db793450cadc6ebfd85";

export default node;
