/**
 * @generated SignedSource<<6a9112d8eab0fa8667190c09c69c4273>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderTableProjectQuery$variables = {
  domain_name: string;
  group_id: string;
  keypair_resource_policy_name: string;
};
export type VFolderTableProjectQuery$data = {
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
export type VFolderTableProjectQuery = {
  response: VFolderTableProjectQuery$data;
  variables: VFolderTableProjectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "domain_name"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "group_id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "keypair_resource_policy_name"
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
        "variableName": "domain_name"
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
    "selections": (v1/*: any*/),
    "storageKey": null
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
    "selections": (v1/*: any*/),
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "VFolderTableProjectQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "VFolderTableProjectQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "2c2ce905afd89e93c6d761f22ed59f3d",
    "id": null,
    "metadata": {},
    "name": "VFolderTableProjectQuery",
    "operationKind": "query",
    "text": "query VFolderTableProjectQuery(\n  $domain_name: String!\n  $group_id: UUID!\n  $keypair_resource_policy_name: String!\n) {\n  domain(name: $domain_name) {\n    allowed_vfolder_hosts\n  }\n  group(id: $group_id, domain_name: $domain_name) {\n    allowed_vfolder_hosts\n  }\n  keypair_resource_policy(name: $keypair_resource_policy_name) {\n    allowed_vfolder_hosts\n  }\n}\n"
  }
};
})();

(node as any).hash = "ccdbaa52a63c2ea005423e7c541eff80";

export default node;
