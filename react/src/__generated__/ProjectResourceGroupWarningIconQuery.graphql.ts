/**
 * @generated SignedSource<<127511c3e4b85dd9dc6a9de1b0b967c6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectResourceGroupWarningIconQuery$variables = {
  domainName?: string | null | undefined;
  projectId: string;
};
export type ProjectResourceGroupWarningIconQuery$data = {
  readonly domain: {
    readonly scaling_groups: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
  readonly group: {
    readonly scaling_groups: ReadonlyArray<string | null | undefined> | null | undefined;
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
    "name": "scaling_groups",
    "storageKey": null
  }
],
v3 = [
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
    "selections": (v2/*: any*/),
    "storageKey": null
  },
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
    "cacheID": "5f9b9b5f991a25f621b704689daacc25",
    "id": null,
    "metadata": {},
    "name": "ProjectResourceGroupWarningIconQuery",
    "operationKind": "query",
    "text": "query ProjectResourceGroupWarningIconQuery(\n  $projectId: UUID!\n  $domainName: String\n) {\n  group(id: $projectId, domain_name: $domainName) {\n    scaling_groups\n  }\n  domain(name: $domainName) {\n    scaling_groups\n  }\n}\n"
  }
};
})();

(node as any).hash = "98245b3b56fdbf24ef2e876349e1344a";

export default node;
