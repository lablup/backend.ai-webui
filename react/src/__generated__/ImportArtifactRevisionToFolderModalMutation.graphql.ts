/**
 * @generated SignedSource<<c0edf71865c977be540f6380db5f7118>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ImportArtifactsInput = {
  artifactRevisionIds: ReadonlyArray<string>;
  options?: ImportArtifactsOptionsGQL | null | undefined;
  vfolderId?: string | null | undefined;
};
export type ImportArtifactsOptionsGQL = {
  force?: boolean;
};
export type ImportArtifactRevisionToFolderModalMutation$variables = {
  input: ImportArtifactsInput;
};
export type ImportArtifactRevisionToFolderModalMutation$data = {
  readonly importArtifacts: {
    readonly artifactRevisions: {
      readonly count: number;
    };
    readonly tasks: ReadonlyArray<{
      readonly artifactRevision: {
        readonly artifact: {
          readonly id: string;
          readonly name: string;
        } | null | undefined;
        readonly id: string;
        readonly version: string;
      };
      readonly taskId: string | null | undefined;
    }>;
  } | null | undefined;
};
export type ImportArtifactRevisionToFolderModalMutation = {
  response: ImportArtifactRevisionToFolderModalMutation$data;
  variables: ImportArtifactRevisionToFolderModalMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "ImportArtifactsPayload",
    "kind": "LinkedField",
    "name": "importArtifacts",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ArtifactRevisionConnection",
        "kind": "LinkedField",
        "name": "artifactRevisions",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "count",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "ArtifactRevisionImportTask",
        "kind": "LinkedField",
        "name": "tasks",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "taskId",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ArtifactRevision",
            "kind": "LinkedField",
            "name": "artifactRevision",
            "plural": false,
            "selections": [
              (v1/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "version",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Artifact",
                "kind": "LinkedField",
                "name": "artifact",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
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
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ImportArtifactRevisionToFolderModalMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ImportArtifactRevisionToFolderModalMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "870d144d05ea4c3ac90a4ce955510b44",
    "id": null,
    "metadata": {},
    "name": "ImportArtifactRevisionToFolderModalMutation",
    "operationKind": "mutation",
    "text": "mutation ImportArtifactRevisionToFolderModalMutation(\n  $input: ImportArtifactsInput!\n) {\n  importArtifacts(input: $input) {\n    artifactRevisions {\n      count\n    }\n    tasks {\n      taskId\n      artifactRevision {\n        id\n        version\n        artifact {\n          id\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b59c2a54c55db7b77c2f8e36c51e81a8";

export default node;
