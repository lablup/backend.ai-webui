/**
 * @generated SignedSource<<32131e49630bbd11c581607c8f2c8d4f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectResourceGroupWarningIconQuery$variables = {
  domainName: string;
  projectId: string;
};
export type ProjectResourceGroupWarningIconQuery$data = {
  readonly adminAllowedResourceGroupsForDomainV2: {
    readonly items: ReadonlyArray<string>;
  } | null | undefined;
  readonly adminAllowedResourceGroupsForProjectV2: {
    readonly items: ReadonlyArray<string>;
  } | null | undefined;
};
export type ProjectResourceGroupWarningIconQuery = {
  response: ProjectResourceGroupWarningIconQuery$data;
  variables: ProjectResourceGroupWarningIconQuery$variables;
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
  "name": "projectId"
},
v2 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "items",
    "storageKey": null
  }
],
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "projectId",
        "variableName": "projectId"
      }
    ],
    "concreteType": "AllowedResourceGroupsPayload",
    "kind": "LinkedField",
    "name": "adminAllowedResourceGroupsForProjectV2",
    "plural": false,
    "selections": (v2/*: any*/),
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "domainName",
        "variableName": "domainName"
      }
    ],
    "concreteType": "AllowedResourceGroupsPayload",
    "kind": "LinkedField",
    "name": "adminAllowedResourceGroupsForDomainV2",
    "plural": false,
    "selections": (v2/*: any*/),
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectResourceGroupWarningIconQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ProjectResourceGroupWarningIconQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "70caff54bf5317d9cd6ded8f3cfb8c60",
    "id": null,
    "metadata": {},
    "name": "ProjectResourceGroupWarningIconQuery",
    "operationKind": "query",
    "text": "query ProjectResourceGroupWarningIconQuery(\n  $projectId: UUID!\n  $domainName: String!\n) {\n  adminAllowedResourceGroupsForProjectV2(projectId: $projectId) {\n    items\n  }\n  adminAllowedResourceGroupsForDomainV2(domainName: $domainName) {\n    items\n  }\n}\n"
  }
};
})();

(node as any).hash = "303ddeb93de8d3f4e5a60ba40d245bf2";

export default node;
