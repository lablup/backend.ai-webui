/**
 * @generated SignedSource<<b8ba62d7db9b4ac975621c61015f073e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ImportArtifactRevisionToFolderModalTestQuery$variables = Record<PropertyKey, never>;
export type ImportArtifactRevisionToFolderModalTestQuery$data = {
  readonly artifact: {
    readonly revisions: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly " $fragmentSpreads": FragmentRefs<"ImportArtifactRevisionToFolderModalArtifactRevisionFragment">;
        };
      }>;
    } | null | undefined;
  } | null | undefined;
  readonly groups: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"ImportArtifactRevisionToFolderModalModelStoreProjectsFragment">;
  } | null | undefined> | null | undefined;
};
export type ImportArtifactRevisionToFolderModalTestQuery = {
  response: ImportArtifactRevisionToFolderModalTestQuery$data;
  variables: ImportArtifactRevisionToFolderModalTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "is_active",
    "value": true
  },
  {
    "kind": "Literal",
    "name": "type",
    "value": [
      "MODEL_STORE"
    ]
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "test-artifact-id"
  }
],
v2 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ImportArtifactRevisionToFolderModalTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "Group",
        "kind": "LinkedField",
        "name": "groups",
        "plural": true,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ImportArtifactRevisionToFolderModalModelStoreProjectsFragment"
          }
        ],
        "storageKey": "groups(is_active:true,type:[\"MODEL_STORE\"])"
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Artifact",
        "kind": "LinkedField",
        "name": "artifact",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*: any*/),
            "concreteType": "ArtifactRevisionConnection",
            "kind": "LinkedField",
            "name": "revisions",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ArtifactRevisionEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ArtifactRevision",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "ImportArtifactRevisionToFolderModalArtifactRevisionFragment"
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "revisions(limit:1)"
          }
        ],
        "storageKey": "artifact(id:\"test-artifact-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ImportArtifactRevisionToFolderModalTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "Group",
        "kind": "LinkedField",
        "name": "groups",
        "plural": true,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          }
        ],
        "storageKey": "groups(is_active:true,type:[\"MODEL_STORE\"])"
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Artifact",
        "kind": "LinkedField",
        "name": "artifact",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*: any*/),
            "concreteType": "ArtifactRevisionConnection",
            "kind": "LinkedField",
            "name": "revisions",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ArtifactRevisionEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ArtifactRevision",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "revisions(limit:1)"
          },
          (v3/*: any*/)
        ],
        "storageKey": "artifact(id:\"test-artifact-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "97d724394c8e156f73fc012143d8be20",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "artifact": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Artifact"
        },
        "artifact.id": (v4/*: any*/),
        "artifact.revisions": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ArtifactRevisionConnection"
        },
        "artifact.revisions.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ArtifactRevisionEdge"
        },
        "artifact.revisions.edges.node": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ArtifactRevision"
        },
        "artifact.revisions.edges.node.id": (v4/*: any*/),
        "groups": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "Group"
        },
        "groups.id": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "UUID"
        },
        "groups.name": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        }
      }
    },
    "name": "ImportArtifactRevisionToFolderModalTestQuery",
    "operationKind": "query",
    "text": "query ImportArtifactRevisionToFolderModalTestQuery {\n  groups(is_active: true, type: [\"MODEL_STORE\"]) {\n    ...ImportArtifactRevisionToFolderModalModelStoreProjectsFragment\n  }\n  artifact(id: \"test-artifact-id\") {\n    revisions(limit: 1) {\n      edges {\n        node {\n          ...ImportArtifactRevisionToFolderModalArtifactRevisionFragment\n          id\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment ImportArtifactRevisionToFolderModalArtifactRevisionFragment on ArtifactRevision {\n  id\n}\n\nfragment ImportArtifactRevisionToFolderModalModelStoreProjectsFragment on Group {\n  id\n  name\n}\n"
  }
};
})();

(node as any).hash = "9ea242f369a7dbc93817a32f5ff0a8b7";

export default node;
