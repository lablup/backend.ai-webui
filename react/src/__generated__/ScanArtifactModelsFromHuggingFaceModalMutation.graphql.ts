/**
 * @generated SignedSource<<8f57e972345299ad14a69f2ecc0667e2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ScanArtifactModelsInput = {
  models: ReadonlyArray<ModelTarget>;
  registryId?: string | null | undefined;
};
export type ModelTarget = {
  modelId: string;
  revision?: string | null | undefined;
};
export type ScanArtifactModelsFromHuggingFaceModalMutation$variables = {
  input: ScanArtifactModelsInput;
};
export type ScanArtifactModelsFromHuggingFaceModalMutation$data = {
  readonly scanArtifactModels: {
    readonly artifactRevision: {
      readonly count: number;
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly artifact: {
            readonly id: string;
          } | null | undefined;
        };
      }>;
    };
  } | null | undefined;
};
export type ScanArtifactModelsFromHuggingFaceModalMutation = {
  response: ScanArtifactModelsFromHuggingFaceModalMutation$data;
  variables: ScanArtifactModelsFromHuggingFaceModalMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "concreteType": "Artifact",
  "kind": "LinkedField",
  "name": "artifact",
  "plural": false,
  "selections": [
    (v3/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ScanArtifactModelsFromHuggingFaceModalMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ScanArtifactModelsPayload",
        "kind": "LinkedField",
        "name": "scanArtifactModels",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ArtifactRevisionConnection",
            "kind": "LinkedField",
            "name": "artifactRevision",
            "plural": false,
            "selections": [
              (v2/*: any*/),
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
                      (v4/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ScanArtifactModelsFromHuggingFaceModalMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ScanArtifactModelsPayload",
        "kind": "LinkedField",
        "name": "scanArtifactModels",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ArtifactRevisionConnection",
            "kind": "LinkedField",
            "name": "artifactRevision",
            "plural": false,
            "selections": [
              (v2/*: any*/),
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
                      (v4/*: any*/),
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
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
    "cacheID": "d250e8933c3d6a6f42114c88bf281409",
    "id": null,
    "metadata": {},
    "name": "ScanArtifactModelsFromHuggingFaceModalMutation",
    "operationKind": "mutation",
    "text": "mutation ScanArtifactModelsFromHuggingFaceModalMutation(\n  $input: ScanArtifactModelsInput!\n) {\n  scanArtifactModels(input: $input) {\n    artifactRevision {\n      count\n      edges {\n        node {\n          artifact {\n            id\n          }\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "21adbb6ef759156a2ad47c577c67e24e";

export default node;
