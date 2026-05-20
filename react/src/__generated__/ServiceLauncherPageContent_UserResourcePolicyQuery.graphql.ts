/**
 * @generated SignedSource<<1f23cc3d4dee3c2510844bb49cf5fd69>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ServiceLauncherPageContent_UserResourcePolicyQuery$variables = {
  user_RP_name?: string | null | undefined;
};
export type ServiceLauncherPageContent_UserResourcePolicyQuery$data = {
  readonly user_resource_policy: {
    readonly max_session_count_per_model_session: number | null | undefined;
  } | null | undefined;
};
export type ServiceLauncherPageContent_UserResourcePolicyQuery = {
  response: ServiceLauncherPageContent_UserResourcePolicyQuery$data;
  variables: ServiceLauncherPageContent_UserResourcePolicyQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "user_RP_name"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "user_RP_name"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_session_count_per_model_session",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ServiceLauncherPageContent_UserResourcePolicyQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UserResourcePolicy",
        "kind": "LinkedField",
        "name": "user_resource_policy",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ServiceLauncherPageContent_UserResourcePolicyQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UserResourcePolicy",
        "kind": "LinkedField",
        "name": "user_resource_policy",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
    ]
  },
  "params": {
    "cacheID": "9521f8ab6e4190bdffb95e25ce45d8c3",
    "id": null,
    "metadata": {},
    "name": "ServiceLauncherPageContent_UserResourcePolicyQuery",
    "operationKind": "query",
    "text": "query ServiceLauncherPageContent_UserResourcePolicyQuery(\n  $user_RP_name: String\n) {\n  user_resource_policy(name: $user_RP_name) @since(version: \"23.09.6\") {\n    max_session_count_per_model_session\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "2625e741ab935b9160f781d3aba13067";

export default node;
