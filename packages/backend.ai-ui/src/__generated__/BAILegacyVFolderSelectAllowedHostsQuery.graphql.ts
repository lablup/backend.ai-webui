/**
 * @generated SignedSource<<06ad97dfa128a943fa470de01ebbd604>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAILegacyVFolderSelectAllowedHostsQuery$variables = {
  domain_name: string;
  group_id: string;
  keypair_resource_policy_name: string;
  skipGroup: boolean;
};
export type BAILegacyVFolderSelectAllowedHostsQuery$data = {
  readonly domain: {
    readonly allowed_vfolder_hosts: string | null | undefined;
  } | null | undefined;
  readonly group?: {
    readonly allowed_vfolder_hosts: string | null | undefined;
  } | null | undefined;
  readonly keypair_resource_policy: {
    readonly allowed_vfolder_hosts: string | null | undefined;
  } | null | undefined;
};
export type BAILegacyVFolderSelectAllowedHostsQuery = {
  response: BAILegacyVFolderSelectAllowedHostsQuery$data;
  variables: BAILegacyVFolderSelectAllowedHostsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domain_name"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "group_id"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "keypair_resource_policy_name"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipGroup"
},
v4 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "allowed_vfolder_hosts",
    "storageKey": null
  }
],
v5 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "domain_name"
      }
    ],
    "concreteType": "Domain",
    "kind": "LinkedField",
    "name": "domain",
    "plural": false,
    "selections": (v4/*: any*/),
    "storageKey": null
  },
  {
    "condition": "skipGroup",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "domain_name",
            "variableName": "domain_name"
          },
          {
            "kind": "Variable",
            "name": "id",
            "variableName": "group_id"
          }
        ],
        "concreteType": "Group",
        "kind": "LinkedField",
        "name": "group",
        "plural": false,
        "selections": (v4/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "keypair_resource_policy_name"
      }
    ],
    "concreteType": "KeyPairResourcePolicy",
    "kind": "LinkedField",
    "name": "keypair_resource_policy",
    "plural": false,
    "selections": (v4/*: any*/),
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAILegacyVFolderSelectAllowedHostsQuery",
    "selections": (v5/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAILegacyVFolderSelectAllowedHostsQuery",
    "selections": (v5/*: any*/)
  },
  "params": {
    "cacheID": "3f052763902c453971af87a143be51f7",
    "id": null,
    "metadata": {},
    "name": "BAILegacyVFolderSelectAllowedHostsQuery",
    "operationKind": "query",
    "text": "query BAILegacyVFolderSelectAllowedHostsQuery(\n  $domain_name: String!\n  $group_id: UUID!\n  $skipGroup: Boolean!\n  $keypair_resource_policy_name: String!\n) {\n  domain(name: $domain_name) {\n    allowed_vfolder_hosts\n  }\n  group(id: $group_id, domain_name: $domain_name) @skip(if: $skipGroup) {\n    allowed_vfolder_hosts\n  }\n  keypair_resource_policy(name: $keypair_resource_policy_name) {\n    allowed_vfolder_hosts\n  }\n}\n"
  }
};
})();

(node as any).hash = "f3d0589f5a7c8e9ea5700327bdf79ec6";

export default node;
