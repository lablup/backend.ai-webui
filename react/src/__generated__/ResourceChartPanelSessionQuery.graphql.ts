/**
 * @generated SignedSource<<8cf50f4aaa1fc712abec2275b935ad4c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type ResourceChartPanelSessionQuery$variables = {
  c0?: string | null | undefined;
  c0On: boolean;
  c1?: string | null | undefined;
  c1On: boolean;
  c2?: string | null | undefined;
  c2On: boolean;
  c3?: string | null | undefined;
  c3On: boolean;
  c4?: string | null | undefined;
  c4On: boolean;
  c5?: string | null | undefined;
  c5On: boolean;
  c6?: string | null | undefined;
  c6On: boolean;
  c7?: string | null | undefined;
  c7On: boolean;
  scopeId?: any | null | undefined;
};
export type ResourceChartPanelSessionQuery$data = {
  readonly c0?: Result<{
    readonly count: number | null | undefined;
  } | null | undefined, unknown>;
  readonly c1?: Result<{
    readonly count: number | null | undefined;
  } | null | undefined, unknown>;
  readonly c2?: Result<{
    readonly count: number | null | undefined;
  } | null | undefined, unknown>;
  readonly c3?: Result<{
    readonly count: number | null | undefined;
  } | null | undefined, unknown>;
  readonly c4?: Result<{
    readonly count: number | null | undefined;
  } | null | undefined, unknown>;
  readonly c5?: Result<{
    readonly count: number | null | undefined;
  } | null | undefined, unknown>;
  readonly c6?: Result<{
    readonly count: number | null | undefined;
  } | null | undefined, unknown>;
  readonly c7?: Result<{
    readonly count: number | null | undefined;
  } | null | undefined, unknown>;
};
export type ResourceChartPanelSessionQuery = {
  response: ResourceChartPanelSessionQuery$data;
  variables: ResourceChartPanelSessionQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c0"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c0On"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c1"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c1On"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c2"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c2On"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c3"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c3On"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c4"
},
v9 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c4On"
},
v10 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c5"
},
v11 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c5On"
},
v12 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c6"
},
v13 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c6On"
},
v14 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c7"
},
v15 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c7On"
},
v16 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeId"
},
v17 = {
  "kind": "Literal",
  "name": "first",
  "value": 1
},
v18 = {
  "kind": "Literal",
  "name": "offset",
  "value": 0
},
v19 = {
  "kind": "Variable",
  "name": "scope_id",
  "variableName": "scopeId"
},
v20 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v21 = {
  "alias": "c0",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c0"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v22 = {
  "alias": "c1",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c1"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v23 = {
  "alias": "c2",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c2"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v24 = {
  "alias": "c3",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c3"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v25 = {
  "alias": "c4",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c4"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v26 = {
  "alias": "c5",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c5"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v27 = {
  "alias": "c6",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c6"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v28 = {
  "alias": "c7",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c7"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v20/*: any*/),
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
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/),
      (v9/*: any*/),
      (v10/*: any*/),
      (v11/*: any*/),
      (v12/*: any*/),
      (v13/*: any*/),
      (v14/*: any*/),
      (v15/*: any*/),
      (v16/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceChartPanelSessionQuery",
    "selections": [
      {
        "condition": "c0On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v21/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c1On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v22/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c2On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v23/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c3On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v24/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c4On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v25/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c5On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v26/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c6On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v27/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c7On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v28/*: any*/),
            "to": "RESULT"
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v16/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/),
      (v9/*: any*/),
      (v10/*: any*/),
      (v11/*: any*/),
      (v12/*: any*/),
      (v13/*: any*/),
      (v14/*: any*/),
      (v15/*: any*/)
    ],
    "kind": "Operation",
    "name": "ResourceChartPanelSessionQuery",
    "selections": [
      {
        "condition": "c0On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v21/*: any*/)
        ]
      },
      {
        "condition": "c1On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v22/*: any*/)
        ]
      },
      {
        "condition": "c2On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v23/*: any*/)
        ]
      },
      {
        "condition": "c3On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v24/*: any*/)
        ]
      },
      {
        "condition": "c4On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v25/*: any*/)
        ]
      },
      {
        "condition": "c5On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v26/*: any*/)
        ]
      },
      {
        "condition": "c6On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v27/*: any*/)
        ]
      },
      {
        "condition": "c7On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v28/*: any*/)
        ]
      }
    ]
  },
  "params": {
    "cacheID": "e614d06bee4ad1eed6fbf99886c6aa26",
    "id": null,
    "metadata": {},
    "name": "ResourceChartPanelSessionQuery",
    "operationKind": "query",
    "text": "query ResourceChartPanelSessionQuery(\n  $scopeId: ScopeField\n  $c0: String\n  $c0On: Boolean!\n  $c1: String\n  $c1On: Boolean!\n  $c2: String\n  $c2On: Boolean!\n  $c3: String\n  $c3On: Boolean!\n  $c4: String\n  $c4On: Boolean!\n  $c5: String\n  $c5On: Boolean!\n  $c6: String\n  $c6On: Boolean!\n  $c7: String\n  $c7On: Boolean!\n) {\n  c0: compute_session_nodes(scope_id: $scopeId, first: 1, offset: 0, filter: $c0) @include(if: $c0On) {\n    count\n  }\n  c1: compute_session_nodes(scope_id: $scopeId, first: 1, offset: 0, filter: $c1) @include(if: $c1On) {\n    count\n  }\n  c2: compute_session_nodes(scope_id: $scopeId, first: 1, offset: 0, filter: $c2) @include(if: $c2On) {\n    count\n  }\n  c3: compute_session_nodes(scope_id: $scopeId, first: 1, offset: 0, filter: $c3) @include(if: $c3On) {\n    count\n  }\n  c4: compute_session_nodes(scope_id: $scopeId, first: 1, offset: 0, filter: $c4) @include(if: $c4On) {\n    count\n  }\n  c5: compute_session_nodes(scope_id: $scopeId, first: 1, offset: 0, filter: $c5) @include(if: $c5On) {\n    count\n  }\n  c6: compute_session_nodes(scope_id: $scopeId, first: 1, offset: 0, filter: $c6) @include(if: $c6On) {\n    count\n  }\n  c7: compute_session_nodes(scope_id: $scopeId, first: 1, offset: 0, filter: $c7) @include(if: $c7On) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "24f41c74f164fd86636ed4051a77e49b";

export default node;
