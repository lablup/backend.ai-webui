/**
 * @generated SignedSource<<99bdccbe04e97785e1504afef94cd266>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AstryxSessionProbeCasesQuery$variables = {
  id1: any;
  id2: any;
  id3: any;
};
export type AstryxSessionProbeCasesQuery$data = {
  readonly error: {
    readonly " $fragmentSpreads": FragmentRefs<"SessionStatusDetailModalFragment" | "SessionStatusTagFragment">;
  } | null | undefined;
  readonly pending: {
    readonly " $fragmentSpreads": FragmentRefs<"SessionStatusTagFragment">;
  } | null | undefined;
  readonly running: {
    readonly " $fragmentSpreads": FragmentRefs<"SessionIdleChecksNodeFragment" | "SessionReservationFragment" | "SessionStatusTagFragment">;
  } | null | undefined;
};
export type AstryxSessionProbeCasesQuery = {
  response: AstryxSessionProbeCasesQuery$data;
  variables: AstryxSessionProbeCasesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id1"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id2"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id3"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id1"
  }
],
v2 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "SessionStatusTagFragment"
},
v3 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id2"
  }
],
v4 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id3"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status_info",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status_data",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "queue_position",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "starts_at",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AstryxSessionProbeCasesQuery",
    "selections": [
      {
        "alias": "running",
        "args": (v1/*: any*/),
        "concreteType": "ComputeSessionNode",
        "kind": "LinkedField",
        "name": "compute_session_node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "SessionReservationFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "SessionIdleChecksNodeFragment"
          }
        ],
        "storageKey": null
      },
      {
        "alias": "pending",
        "args": (v3/*: any*/),
        "concreteType": "ComputeSessionNode",
        "kind": "LinkedField",
        "name": "compute_session_node",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": "error",
        "args": (v4/*: any*/),
        "concreteType": "ComputeSessionNode",
        "kind": "LinkedField",
        "name": "compute_session_node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "SessionStatusDetailModalFragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AstryxSessionProbeCasesQuery",
    "selections": [
      {
        "alias": "running",
        "args": (v1/*: any*/),
        "concreteType": "ComputeSessionNode",
        "kind": "LinkedField",
        "name": "compute_session_node",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/),
          (v9/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "created_at",
            "storageKey": null
          },
          (v10/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "terminated_at",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "idle_checks",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": "pending",
        "args": (v3/*: any*/),
        "concreteType": "ComputeSessionNode",
        "kind": "LinkedField",
        "name": "compute_session_node",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/),
          (v9/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": "error",
        "args": (v4/*: any*/),
        "concreteType": "ComputeSessionNode",
        "kind": "LinkedField",
        "name": "compute_session_node",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/),
          (v9/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          (v10/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "34f258c08b6db62df953842ebe3f5c1d",
    "id": null,
    "metadata": {},
    "name": "AstryxSessionProbeCasesQuery",
    "operationKind": "query",
    "text": "query AstryxSessionProbeCasesQuery(\n  $id1: GlobalIDField!\n  $id2: GlobalIDField!\n  $id3: GlobalIDField!\n) {\n  running: compute_session_node(id: $id1) {\n    ...SessionStatusTagFragment\n    ...SessionReservationFragment\n    ...SessionIdleChecksNodeFragment\n    id\n  }\n  pending: compute_session_node(id: $id2) {\n    ...SessionStatusTagFragment\n    id\n  }\n  error: compute_session_node(id: $id3) {\n    ...SessionStatusTagFragment\n    ...SessionStatusDetailModalFragment\n    id\n  }\n}\n\nfragment SessionIdleChecksNodeFragment on ComputeSessionNode {\n  id\n  idle_checks\n  ...SessionReclamationStatusCellFragment\n}\n\nfragment SessionReclamationStatusCellFragment on ComputeSessionNode {\n  id\n  idle_checks\n  ...SessionReclamationStatusPopoverFragment\n}\n\nfragment SessionReclamationStatusPopoverFragment on ComputeSessionNode {\n  id\n  idle_checks\n}\n\nfragment SessionReservationFragment on ComputeSessionNode {\n  id\n  created_at\n  starts_at\n  terminated_at\n}\n\nfragment SessionStatusDetailModalFragment on ComputeSessionNode {\n  id\n  name\n  status\n  status_info\n  status_data\n  starts_at\n  ...SessionStatusTagFragment\n}\n\nfragment SessionStatusTagFragment on ComputeSessionNode {\n  id\n  status\n  status_info\n  status_data\n  queue_position @since(version: \"25.13.0\")\n}\n"
  }
};
})();

(node as any).hash = "2f3faa634d657f1b01bf9cb1df432a32";

export default node;
