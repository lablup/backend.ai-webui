/**
 * @generated SignedSource<<3c1d6bfcf131846387e61507ff172a43>>
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
  readonly scopedAtomicBulkUpsertAppConfigFragments: {
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
    "name": "scopedAtomicBulkUpsertAppConfigFragments",
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
    "name": "useAppConfigUpsertMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useAppConfigUpsertMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3d2c57add9cce1ef8c7953aa562f838e",
    "id": null,
    "metadata": {},
    "name": "useAppConfigUpsertMutation",
    "operationKind": "mutation",
    "text": "mutation useAppConfigUpsertMutation(\n  $input: ScopedUpsertAppConfigFragmentsInput!\n) {\n  scopedAtomicBulkUpsertAppConfigFragments(input: $input) {\n    items {\n      id\n      configName\n      config\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "60cd6220b2cdfe588de70b238bb1d967";

export default node;
