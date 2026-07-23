/**
 * @generated SignedSource<<842a0e345d5b4d4233330050acd7c309>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AgentDetailDrawerRescanGPUAllocationMapMutation$variables = {
  agentId: string;
};
export type AgentDetailDrawerRescanGPUAllocationMapMutation$data = {
  readonly rescan_gpu_alloc_maps: {
    readonly task_id: string | null | undefined;
  } | null | undefined;
};
export type AgentDetailDrawerRescanGPUAllocationMapMutation = {
  response: AgentDetailDrawerRescanGPUAllocationMapMutation$data;
  variables: AgentDetailDrawerRescanGPUAllocationMapMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "agentId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "agent_id",
        "variableName": "agentId"
      }
    ],
    "concreteType": "RescanGPUAllocMaps",
    "kind": "LinkedField",
    "name": "rescan_gpu_alloc_maps",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "task_id",
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
    "name": "AgentDetailDrawerRescanGPUAllocationMapMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AgentDetailDrawerRescanGPUAllocationMapMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "c7608cd20db1c3216270cd684a312ec0",
    "id": null,
    "metadata": {},
    "name": "AgentDetailDrawerRescanGPUAllocationMapMutation",
    "operationKind": "mutation",
    "text": "mutation AgentDetailDrawerRescanGPUAllocationMapMutation(\n  $agentId: String!\n) {\n  rescan_gpu_alloc_maps(agent_id: $agentId) {\n    task_id\n  }\n}\n"
  }
};
})();

(node as any).hash = "b0dd2f0af2577b12e8af99ee3ead9509";

export default node;
