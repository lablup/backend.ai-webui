/**
 * @generated SignedSource<<c1fccec7250457cf07244eb8952836b3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectResourcePolicyListQuery$variables = Record<PropertyKey, never>;
export type ProjectResourcePolicyListQuery$data = {
  readonly project_resource_policies: ReadonlyArray<{
    readonly created_at: string;
    readonly id: string;
    readonly max_network_count: number | null | undefined;
    readonly max_quota_scope_size: any | null | undefined;
    readonly max_vfolder_count: number | null | undefined;
    readonly name: string;
    readonly " $fragmentSpreads": FragmentRefs<"ProjectResourcePolicySettingModalFragment">;
  } | null | undefined> | null | undefined;
};
export type ProjectResourcePolicyListQuery = {
  response: ProjectResourcePolicyListQuery$data;
  variables: ProjectResourcePolicyListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "created_at",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_vfolder_count",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_quota_scope_size",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_network_count",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectResourcePolicyListQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ProjectResourcePolicy",
        "kind": "LinkedField",
        "name": "project_resource_policies",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ProjectResourcePolicySettingModalFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ProjectResourcePolicyListQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ProjectResourcePolicy",
        "kind": "LinkedField",
        "name": "project_resource_policies",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "6aea9773e50cdfa81562c7a8322c8faa",
    "id": null,
    "metadata": {},
    "name": "ProjectResourcePolicyListQuery",
    "operationKind": "query",
    "text": "query ProjectResourcePolicyListQuery {\n  project_resource_policies {\n    id\n    name\n    created_at\n    max_vfolder_count @since(version: \"23.09.6\")\n    max_quota_scope_size @since(version: \"23.09.2\")\n    max_network_count @since(version: \"24.12.0\")\n    ...ProjectResourcePolicySettingModalFragment\n  }\n}\n\nfragment ProjectResourcePolicySettingModalFragment on ProjectResourcePolicy {\n  id\n  name\n  created_at\n  max_vfolder_count @since(version: \"23.09.6\")\n  max_quota_scope_size @since(version: \"23.09.2\")\n  max_network_count @since(version: \"24.12.0\")\n}\n"
  }
};
})();

(node as any).hash = "4c7451b05822ee2f8c5e2c8d35ed57db";

export default node;
