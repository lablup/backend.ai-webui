/**
 * @generated SignedSource<<3783c31b97e6927c8866a8795f8dfd37>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionListQuery$variables = {
  ak?: string | null;
  group_id?: string | null;
  limit: number;
  offset: number;
  skipClusterSize: boolean;
  status?: string | null;
};
export type SessionListQuery$data = {
  readonly compute_session_list: {
    readonly items: ReadonlyArray<{
      readonly access_key: string | null;
      readonly architecture: string | null;
      readonly cluster_size: number | null;
      readonly created_at: any | null;
      readonly id: string | null;
      readonly image: string | null;
      readonly mounts: ReadonlyArray<string | null> | null;
      readonly name: string | null;
      readonly occupied_slots: any | null;
      readonly service_ports: any | null;
      readonly session_id: any | null;
      readonly starts_at: any | null;
      readonly status: string | null;
      readonly status_info: string | null;
      readonly terminated_at: any | null;
      readonly type: string | null;
      readonly " $fragmentSpreads": FragmentRefs<"SessionInfoCellFragment">;
    } | null>;
  } | null;
};
export type SessionListQuery = {
  response: SessionListQuery$data;
  variables: SessionListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "ak"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "group_id"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipClusterSize"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "status"
},
v6 = [
  {
    "kind": "Variable",
    "name": "access_key",
    "variableName": "ak"
  },
  {
    "kind": "Variable",
    "name": "group_id",
    "variableName": "group_id"
  },
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Variable",
    "name": "status",
    "variableName": "status"
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "session_id",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "image",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "architecture",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "created_at",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "terminated_at",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status_info",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "service_ports",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mounts",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "occupied_slots",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "access_key",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "starts_at",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cluster_size",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "SessionListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "ComputeSessionList",
        "kind": "LinkedField",
        "name": "compute_session_list",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ComputeSession",
            "kind": "LinkedField",
            "name": "items",
            "plural": true,
            "selections": [
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              (v11/*: any*/),
              (v12/*: any*/),
              (v13/*: any*/),
              (v14/*: any*/),
              (v15/*: any*/),
              (v16/*: any*/),
              (v17/*: any*/),
              (v18/*: any*/),
              (v19/*: any*/),
              (v20/*: any*/),
              (v21/*: any*/),
              (v22/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "SessionInfoCellFragment"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Queries",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v3/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v5/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "SessionListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "ComputeSessionList",
        "kind": "LinkedField",
        "name": "compute_session_list",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ComputeSession",
            "kind": "LinkedField",
            "name": "items",
            "plural": true,
            "selections": [
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              (v11/*: any*/),
              (v12/*: any*/),
              (v13/*: any*/),
              (v14/*: any*/),
              (v15/*: any*/),
              (v16/*: any*/),
              (v17/*: any*/),
              (v18/*: any*/),
              (v19/*: any*/),
              (v20/*: any*/),
              (v21/*: any*/),
              (v22/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "user_email",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "60ba1098fb1381d9f6c3523f07063dec",
    "id": null,
    "metadata": {},
    "name": "SessionListQuery",
    "operationKind": "query",
    "text": "query SessionListQuery(\n  $limit: Int!\n  $offset: Int!\n  $ak: String\n  $group_id: String\n  $status: String\n  $skipClusterSize: Boolean!\n) {\n  compute_session_list(limit: $limit, offset: $offset, access_key: $ak, group_id: $group_id, status: $status) {\n    items {\n      id\n      type\n      session_id\n      name\n      image\n      architecture\n      created_at\n      terminated_at\n      status\n      status_info\n      service_ports\n      mounts\n      occupied_slots\n      access_key\n      starts_at\n      cluster_size @skipOnClient(if: $skipClusterSize)\n      ...SessionInfoCellFragment\n    }\n  }\n}\n\nfragment SessionInfoCellFragment on ComputeSession {\n  id\n  session_id\n  name\n  status\n  user_email\n}\n"
  }
};
})();

(node as any).hash = "c41131439f810b7c5cd0bd9eb2857a46";

export default node;
