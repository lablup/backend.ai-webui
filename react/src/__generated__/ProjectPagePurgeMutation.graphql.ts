/**
 * @generated SignedSource<<3d370296e3985b3e39e03f89bb10df4b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectPagePurgeMutation$variables = {
  projectId: string;
};
export type ProjectPagePurgeMutation$data = {
  readonly adminPurgeProjectV2: {
    readonly purged: boolean;
  } | null | undefined;
};
export type ProjectPagePurgeMutation = {
  response: ProjectPagePurgeMutation$data;
  variables: ProjectPagePurgeMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "projectId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "projectId",
        "variableName": "projectId"
      }
    ],
    "concreteType": "PurgeProjectPayload",
    "kind": "LinkedField",
    "name": "adminPurgeProjectV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "purged",
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
    "name": "ProjectPagePurgeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectPagePurgeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "dcf118c8bf890919ac4b343191526dfa",
    "id": null,
    "metadata": {},
    "name": "ProjectPagePurgeMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectPagePurgeMutation(\n  $projectId: UUID!\n) {\n  adminPurgeProjectV2(projectId: $projectId) {\n    purged\n  }\n}\n"
  }
};
})();

(node as any).hash = "5d49b3468b32bb0051199584b39df811";

export default node;
