/**
 * @generated SignedSource<<18bd2b856a5a23123ac1f97326a920e0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ServingPageQuery$variables = {
  filter?: string | null | undefined;
  limit: number;
  offset: number;
  order?: string | null | undefined;
  projectID?: string | null | undefined;
};
export type ServingPageQuery$data = {
  readonly endpoint_list: {
    readonly items: ReadonlyArray<{
      readonly project: string | null | undefined;
      readonly " $fragmentSpreads": FragmentRefs<"EndpointListFragment">;
    } | null | undefined>;
    readonly total_count: number;
  } | null | undefined;
};
export type ServingPageQuery = {
  response: ServingPageQuery$data;
  variables: ServingPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "order"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectID"
},
v5 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
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
    "name": "order",
    "variableName": "order"
  },
  {
    "kind": "Variable",
    "name": "project",
    "variableName": "projectID"
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "total_count",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "project",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "created_user_email",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ServingPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "EndpointList",
        "kind": "LinkedField",
        "name": "endpoint_list",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Endpoint",
            "kind": "LinkedField",
            "name": "items",
            "plural": true,
            "selections": [
              (v7/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "EndpointListFragment"
              }
            ],
            "storageKey": null
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
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v4/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "ServingPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "EndpointList",
        "kind": "LinkedField",
        "name": "endpoint_list",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Endpoint",
            "kind": "LinkedField",
            "name": "items",
            "plural": true,
            "selections": [
              (v7/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "endpoint_id",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "status",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "lifecycle_stage",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "url",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "open_to_public",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "created_at",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "replicas",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "desired_session_count",
                "storageKey": null
              },
              (v8/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "RuntimeVariantInfo",
                "kind": "LinkedField",
                "name": "runtime_variant",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "human_readable_name",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              },
              (v8/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "session_owner_email",
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
    "cacheID": "32c8f3974194c009a4d5953491563a7f",
    "id": null,
    "metadata": {},
    "name": "ServingPageQuery",
    "operationKind": "query",
    "text": "query ServingPageQuery(\n  $offset: Int!\n  $limit: Int!\n  $projectID: UUID\n  $filter: String\n  $order: String\n) {\n  endpoint_list(offset: $offset, limit: $limit, project: $projectID, filter: $filter, order: $order) {\n    total_count\n    items {\n      project\n      ...EndpointListFragment\n      id\n    }\n  }\n}\n\nfragment EndpointListFragment on Endpoint {\n  name\n  endpoint_id\n  status\n  lifecycle_stage\n  url\n  open_to_public\n  created_at\n  replicas\n  desired_session_count\n  project\n  created_user_email\n  runtime_variant {\n    human_readable_name\n  }\n  ...EndpointOwnerInfoFragment\n  ...EndpointStatusTagFragment\n}\n\nfragment EndpointOwnerInfoFragment on Endpoint {\n  id\n  created_user_email @since(version: \"23.09.8\")\n  session_owner_email @since(version: \"23.09.8\")\n}\n\nfragment EndpointStatusTagFragment on Endpoint {\n  id\n  status\n}\n"
  }
};
})();

(node as any).hash = "2d0fa7758afe629c6ce24ae4a01afd75";

export default node;
