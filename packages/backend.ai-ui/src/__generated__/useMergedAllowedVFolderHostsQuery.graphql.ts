/**
 * @generated SignedSource<<ac2edda6d0a20189c0df198b3ed547bb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useMergedAllowedVFolderHostsQuery$variables = {
  domainName: string;
  keypairResourcePolicyName?: string | null | undefined;
  projectId: string;
  skipProject: boolean;
};
export type useMergedAllowedVFolderHostsQuery$data = {
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
export type useMergedAllowedVFolderHostsQuery = {
  response: useMergedAllowedVFolderHostsQuery$data;
  variables: useMergedAllowedVFolderHostsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainName"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "keypairResourcePolicyName"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectId"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipProject"
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
        "variableName": "domainName"
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
    "condition": "skipProject",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "domain_name",
            "variableName": "domainName"
          },
          {
            "kind": "Variable",
            "name": "id",
            "variableName": "projectId"
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
        "variableName": "keypairResourcePolicyName"
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
    "name": "useMergedAllowedVFolderHostsQuery",
    "selections": (v5/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "useMergedAllowedVFolderHostsQuery",
    "selections": (v5/*: any*/)
  },
  "params": {
    "cacheID": "2f1d83601c589f78fa0e245b17b880cd",
    "id": null,
    "metadata": {},
    "name": "useMergedAllowedVFolderHostsQuery",
    "operationKind": "query",
    "text": "query useMergedAllowedVFolderHostsQuery(\n  $domainName: String!\n  $projectId: UUID!\n  $skipProject: Boolean!\n  $keypairResourcePolicyName: String\n) {\n  domain(name: $domainName) {\n    allowed_vfolder_hosts\n  }\n  group(id: $projectId, domain_name: $domainName) @skip(if: $skipProject) {\n    allowed_vfolder_hosts\n  }\n  keypair_resource_policy(name: $keypairResourcePolicyName) {\n    allowed_vfolder_hosts\n  }\n}\n"
  }
};
})();

(node as any).hash = "bb209fda7f20cc5baed6b951416389a9";

export default node;
