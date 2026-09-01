/**
 * @generated SignedSource<<9af402f38cf05d6ce8c1dec90443b750>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery$variables = {
  domainName?: string | null | undefined;
  projectId: string;
  resourcePolicyName?: string | null | undefined;
  skipProjectScope: boolean;
};
export type useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery$data = {
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
export type useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery = {
  response: useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery$data;
  variables: useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "domainName"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "projectId"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "resourcePolicyName"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skipProjectScope"
  }
],
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "allowed_vfolder_hosts",
    "storageKey": null
  }
],
v2 = [
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
    "selections": (v1/*: any*/),
    "storageKey": null
  },
  {
    "condition": "skipProjectScope",
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
        "selections": (v1/*: any*/),
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
        "variableName": "resourcePolicyName"
      }
    ],
    "concreteType": "KeyPairResourcePolicy",
    "kind": "LinkedField",
    "name": "keypair_resource_policy",
    "plural": false,
    "selections": (v1/*: any*/),
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "d7039e705450efc38a646cd5cdc70184",
    "id": null,
    "metadata": {},
    "name": "useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery",
    "operationKind": "query",
    "text": "query useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery(\n  $domainName: String\n  $projectId: UUID!\n  $resourcePolicyName: String\n  $skipProjectScope: Boolean!\n) {\n  domain(name: $domainName) {\n    allowed_vfolder_hosts\n  }\n  group(id: $projectId, domain_name: $domainName) @skip(if: $skipProjectScope) {\n    allowed_vfolder_hosts\n  }\n  keypair_resource_policy(name: $resourcePolicyName) {\n    allowed_vfolder_hosts\n  }\n}\n"
  }
};
})();

(node as any).hash = "ad7ef1c40361740cddc3f40566121f8c";

export default node;
