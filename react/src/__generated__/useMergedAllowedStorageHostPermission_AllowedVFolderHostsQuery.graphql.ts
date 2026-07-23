/**
 * @generated SignedSource<<01f84eec24a9462f4d8a239a0f8488c5>>
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
};
export type useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery$data = {
  readonly domain: {
    readonly allowed_vfolder_hosts: string | null | undefined;
  } | null | undefined;
  readonly group: {
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
    "cacheID": "f7d16150a7d77cb465733a2933a08261",
    "id": null,
    "metadata": {},
    "name": "useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery",
    "operationKind": "query",
    "text": "query useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery(\n  $domainName: String\n  $projectId: UUID!\n  $resourcePolicyName: String\n) {\n  domain(name: $domainName) {\n    allowed_vfolder_hosts\n  }\n  group(id: $projectId, domain_name: $domainName) {\n    allowed_vfolder_hosts\n  }\n  keypair_resource_policy(name: $resourcePolicyName) {\n    allowed_vfolder_hosts\n  }\n}\n"
  }
};
})();

(node as any).hash = "616594ca9d6c787458c32688c1a25b1f";

export default node;
