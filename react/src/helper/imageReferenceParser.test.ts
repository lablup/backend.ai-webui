/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  parseImageReferenceLine,
  resolveImageReference,
  type RegistryRow,
} from './imageReferenceParser';
import { describe, expect, it } from 'vitest';

/** The registered-registry list every vector resolves against by default. */
const DEFAULT_REGISTRIES: Array<RegistryRow> = [
  {
    registry_name: 'nvcr.io',
    project: 'nvidia',
  },
  {
    registry_name: 'nvcr.io',
    project: 'nim/meta',
  },
  {
    registry_name: 'cr.backend.ai',
    project: 'stable',
  },
  {
    registry_name: 'index.docker.io',
    project: 'library',
  },
  {
    registry_name: 'harbor.local:5000',
    project: 'proj',
  },
  {
    registry_name: 'mirror.internal',
    project: null,
  },
];

interface Expected {
  kind: string;
  registryHost: string | null;
  project: string | null;
  imageName: string | null;
  tag: string | null;
  canonical: string | null;
  submittable: boolean;
  reason: string | null;
}

const run = (
  input: string,
  registries: ReadonlyArray<RegistryRow>,
): Expected => {
  const resolved = resolveImageReference(
    parseImageReferenceLine(input),
    registries,
  );
  return {
    kind: resolved.kind,
    registryHost: resolved.registryHost,
    project: resolved.project,
    imageName: resolved.imageName,
    tag: resolved.tag,
    canonical: resolved.canonical,
    submittable: resolved.submittable,
    reason: resolved.reason,
  };
};

/** Verbatim from the FR-3934 grammar note, section 10. */
const vectors: Array<{
  id: string;
  input: string;
  registries?: Array<RegistryRow>;
  expected: Expected;
}> = [
  {
    id: 'V01',
    input: 'https://catalog.ngc.nvidia.com/orgs/nvidia/-/containers/pytorch/-',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'tag_required',
    },
  },
  {
    id: 'V02',
    input:
      'https://catalog.ngc.nvidia.com/orgs/nvidia/-/containers/pytorch/25.01-py3',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: '25.01-py3',
      canonical: 'nvcr.io/nvidia/pytorch:25.01-py3',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V03',
    input: 'https://catalog.ngc.nvidia.com/orgs/nvidia/containers/pytorch',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'tag_required',
    },
  },
  {
    id: 'V04',
    input: 'https://catalog.ngc.nvidia.com/orgs/nvidia/containers/pytorch/',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'tag_required',
    },
  },
  {
    id: 'V05',
    input: 'https://catalog.ngc.nvidia.com/orgs/nvidia/containers/pytorch/tags',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'tag_required',
    },
  },
  {
    id: 'V06',
    input:
      'https://catalog.ngc.nvidia.com/orgs/nvidia/containers/pytorch/tags/25.01-py3',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: '25.01-py3',
      canonical: 'nvcr.io/nvidia/pytorch:25.01-py3',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V07',
    input:
      'https://catalog.ngc.nvidia.com/orgs/nvidia/-/containers/pytorch/-/tags/25.01-py3?utm_source=x&_lr=1',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: '25.01-py3',
      canonical: 'nvcr.io/nvidia/pytorch:25.01-py3',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V08',
    input:
      'https://catalog.ngc.nvidia.com/orgs/nvidia/-/containers/pytorch/-/layers',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'tag_required',
    },
  },
  {
    id: 'V09',
    input:
      'https://catalog.ngc.nvidia.com/orgs/nvidia/-/containers/pytorch/-?_lr=1',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'tag_required',
    },
  },
  {
    id: 'V10',
    input:
      'https://catalog.ngc.nvidia.com/orgs/nvidia/-/containers/cuda/12.6.0-devel-ubuntu24.04',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'cuda',
      tag: '12.6.0-devel-ubuntu24.04',
      canonical: 'nvcr.io/nvidia/cuda:12.6.0-devel-ubuntu24.04',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V11',
    input:
      'https://catalog.ngc.nvidia.com/orgs/nvidia/teams/clara/containers/monai-toolkit',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'clara/monai-toolkit',
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'tag_required',
    },
  },
  {
    id: 'V12',
    input:
      'https://catalog.ngc.nvidia.com/orgs/nvidia/clara/containers/monai-toolkit/2.4',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'clara/monai-toolkit',
      tag: '2.4',
      canonical: 'nvcr.io/nvidia/clara/monai-toolkit:2.4',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V13',
    input:
      'https://catalog.ngc.nvidia.com/orgs/nvidia/teams/clara/containers/monai-toolkit/tags/2.4',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'clara/monai-toolkit',
      tag: '2.4',
      canonical: 'nvcr.io/nvidia/clara/monai-toolkit:2.4',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V14',
    input:
      'https://catalog.ngc.nvidia.com/orgs/nim/teams/meta/containers/llama-3.1-8b-instruct',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nim/meta',
      imageName: 'llama-3.1-8b-instruct',
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'tag_required',
    },
  },
  {
    id: 'V15',
    input:
      'https://catalog.ngc.nvidia.com/orgs/nim/meta/containers/llama-3.1-8b-instruct/1.8.6',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nim/meta',
      imageName: 'llama-3.1-8b-instruct',
      tag: '1.8.6',
      canonical: 'nvcr.io/nim/meta/llama-3.1-8b-instruct:1.8.6',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V16',
    input: 'https://ngc.nvidia.com/catalog/containers/nvidia:pytorch',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'tag_required',
    },
  },
  {
    id: 'V17',
    input:
      'https://ngc.nvidia.com/catalog/containers/nvidia:clara:monai-toolkit',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'clara/monai-toolkit',
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'tag_required',
    },
  },
  {
    id: 'V18',
    input:
      'https://ngc.nvidia.com/orgs/nvidia/containers/pytorch/tags/25.01-py3',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: '25.01-py3',
      canonical: 'nvcr.io/nvidia/pytorch:25.01-py3',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V19',
    input: 'catalog.ngc.nvidia.com/orgs/nvidia/-/containers/pytorch/25.01-py3',
    expected: {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: '25.01-py3',
      canonical: 'nvcr.io/nvidia/pytorch:25.01-py3',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V20',
    input: 'https://catalog.ngc.nvidia.com/orgs/nvidia/models/nvidia_hifigan',
    expected: {
      kind: 'ngc-url',
      registryHost: null,
      project: null,
      imageName: null,
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'ngc_not_a_container',
    },
  },
  {
    id: 'V21',
    input:
      'https://catalog.ngc.nvidia.com/orgs/nvidia/-/collections/nemo_asr/-',
    expected: {
      kind: 'ngc-url',
      registryHost: null,
      project: null,
      imageName: null,
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'ngc_not_a_container',
    },
  },
  {
    id: 'V22',
    input: 'https://catalog.ngc.nvidia.com/orgs/nvidia/resources/nemo',
    expected: {
      kind: 'ngc-url',
      registryHost: null,
      project: null,
      imageName: null,
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'ngc_not_a_container',
    },
  },
  {
    id: 'V23',
    input: 'https://catalog.ngc.nvidia.com/orgs/nvidia/helm-charts/riva-api',
    expected: {
      kind: 'ngc-url',
      registryHost: null,
      project: null,
      imageName: null,
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'ngc_not_a_container',
    },
  },
  {
    id: 'V24',
    input: 'https://catalog.ngc.nvidia.com/search?q=pytorch',
    expected: {
      kind: 'ngc-url',
      registryHost: null,
      project: null,
      imageName: null,
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'ngc_url_unparseable',
    },
  },
  {
    id: 'V25',
    input: 'https://catalog.ngc.nvidia.com/containers',
    expected: {
      kind: 'ngc-url',
      registryHost: null,
      project: null,
      imageName: null,
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'ngc_url_unparseable',
    },
  },
  {
    id: 'V26',
    input: 'https://catalog.ngc.nvidia.com/orgs/nvidia',
    expected: {
      kind: 'ngc-url',
      registryHost: null,
      project: null,
      imageName: null,
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'ngc_url_unparseable',
    },
  },
  {
    id: 'V27',
    input: 'docker pull nvcr.io/nvidia/pytorch:25.01-py3',
    expected: {
      kind: 'pull-command',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: '25.01-py3',
      canonical: 'nvcr.io/nvidia/pytorch:25.01-py3',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V28',
    input: '$ docker pull nvcr.io/nvidia/pytorch:25.01-py3',
    expected: {
      kind: 'pull-command',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: '25.01-py3',
      canonical: 'nvcr.io/nvidia/pytorch:25.01-py3',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V29',
    input: '$ sudo docker pull   nvcr.io/nvidia/pytorch:25.01-py3   ',
    expected: {
      kind: 'pull-command',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: '25.01-py3',
      canonical: 'nvcr.io/nvidia/pytorch:25.01-py3',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V30',
    input: 'podman pull nvcr.io/nvidia/clara/monai-toolkit:2.4',
    expected: {
      kind: 'pull-command',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'clara/monai-toolkit',
      tag: '2.4',
      canonical: 'nvcr.io/nvidia/clara/monai-toolkit:2.4',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V31',
    input: 'docker pull nvcr.io/nvidia/pytorch',
    expected: {
      kind: 'pull-command',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'tag_required',
    },
  },
  {
    id: 'V32',
    input:
      'docker pull nvcr.io/nvidia/pytorch@sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    expected: {
      kind: 'pull-command',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'digest_unsupported',
    },
  },
  {
    id: 'V33',
    input: 'docker run --gpus all -it nvcr.io/nvidia/pytorch:25.01-py3',
    expected: {
      kind: 'pull-command',
      registryHost: null,
      project: null,
      imageName: null,
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'unsupported_command',
    },
  },
  {
    id: 'V34',
    input: 'nvcr.io/nvidia/pytorch:25.01-py3',
    expected: {
      kind: 'canonical',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: '25.01-py3',
      canonical: 'nvcr.io/nvidia/pytorch:25.01-py3',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V35',
    input: 'nvcr.io/nvidia/pytorch:26.08-py3',
    expected: {
      kind: 'canonical',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: '26.08-py3',
      canonical: 'nvcr.io/nvidia/pytorch:26.08-py3',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V36',
    input: 'nvcr.io/nvidia/clara/monai-toolkit:2.4',
    expected: {
      kind: 'canonical',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'clara/monai-toolkit',
      tag: '2.4',
      canonical: 'nvcr.io/nvidia/clara/monai-toolkit:2.4',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V37',
    input: 'nvcr.io/nim/meta/llama-3.1-8b-instruct:latest',
    expected: {
      kind: 'canonical',
      registryHost: 'nvcr.io',
      project: 'nim/meta',
      imageName: 'llama-3.1-8b-instruct',
      tag: 'latest',
      canonical: 'nvcr.io/nim/meta/llama-3.1-8b-instruct:latest',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V38',
    input: 'nvcr.io/nvidia/pytorch',
    expected: {
      kind: 'canonical',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'tag_required',
    },
  },
  {
    id: 'V39',
    input: 'cr.backend.ai/stable/python:3.9-ubuntu20.04',
    expected: {
      kind: 'canonical',
      registryHost: 'cr.backend.ai',
      project: 'stable',
      imageName: 'python',
      tag: '3.9-ubuntu20.04',
      canonical: 'cr.backend.ai/stable/python:3.9-ubuntu20.04',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V40',
    input: 'harbor.local:5000/proj/name:1.0',
    expected: {
      kind: 'canonical',
      registryHost: 'harbor.local:5000',
      project: 'proj',
      imageName: 'name',
      tag: '1.0',
      canonical: 'harbor.local:5000/proj/name:1.0',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V41',
    input: 'harbor.local:5000/proj/sub/name:1.0',
    expected: {
      kind: 'canonical',
      registryHost: 'harbor.local:5000',
      project: 'proj',
      imageName: 'sub/name',
      tag: '1.0',
      canonical: 'harbor.local:5000/proj/sub/name:1.0',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V42',
    input: 'mirror.internal/team/group/app:1.0',
    expected: {
      kind: 'canonical',
      registryHost: 'mirror.internal',
      project: null,
      imageName: 'team/group/app',
      tag: '1.0',
      canonical: 'mirror.internal/team/group/app:1.0',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V43',
    input: 'index.docker.io/library/python:3.12',
    expected: {
      kind: 'canonical',
      registryHost: 'index.docker.io',
      project: 'library',
      imageName: 'python',
      tag: '3.12',
      canonical: 'index.docker.io/library/python:3.12',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V44',
    input: 'docker.io/library/python:3.12',
    expected: {
      kind: 'canonical',
      registryHost: 'docker.io',
      project: null,
      imageName: null,
      tag: '3.12',
      canonical: null,
      submittable: false,
      reason: 'registry_not_registered',
    },
  },
  {
    id: 'V45',
    input: 'python:3.12',
    expected: {
      kind: 'canonical',
      registryHost: null,
      project: null,
      imageName: 'python',
      tag: '3.12',
      canonical: null,
      submittable: false,
      reason: 'host_required',
    },
  },
  {
    id: 'V46',
    input: 'library/python:3.12',
    expected: {
      kind: 'canonical',
      registryHost: null,
      project: null,
      imageName: 'library/python',
      tag: '3.12',
      canonical: null,
      submittable: false,
      reason: 'host_required',
    },
  },
  {
    id: 'V47',
    input: 'python',
    expected: {
      kind: 'canonical',
      registryHost: null,
      project: null,
      imageName: 'python',
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'host_required',
    },
  },
  {
    id: 'V48',
    input: 'ghcr.io/acme/app:1.0',
    expected: {
      kind: 'canonical',
      registryHost: 'ghcr.io',
      project: null,
      imageName: null,
      tag: '1.0',
      canonical: null,
      submittable: false,
      reason: 'registry_not_registered',
    },
  },
  {
    id: 'V49',
    input: 'nvcr.io/nvidia/clara/monai-toolkit:2.4',
    registries: [
      {
        registry_name: 'nvcr.io',
        project: 'nvidia',
      },
      {
        registry_name: 'nvcr.io',
        project: 'nvidia/clara',
      },
    ],
    expected: {
      kind: 'canonical',
      registryHost: 'nvcr.io',
      project: 'nvidia/clara',
      imageName: 'monai-toolkit',
      tag: '2.4',
      canonical: null,
      submittable: false,
      reason: 'registry_ambiguous',
    },
  },
  {
    id: 'V50',
    input: 'nvcr.io/nvidia/clara/monai-toolkit:2.4',
    registries: [
      {
        registry_name: 'nvcr.io',
        project: 'nvidia/clara',
      },
    ],
    expected: {
      kind: 'canonical',
      registryHost: 'nvcr.io',
      project: 'nvidia/clara',
      imageName: 'monai-toolkit',
      tag: '2.4',
      canonical: 'nvcr.io/nvidia/clara/monai-toolkit:2.4',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V51',
    input: 'nvcr.io/nvidia/clara/monai-toolkit:2.4',
    registries: [
      {
        registry_name: 'nvcr.io',
        project: null,
      },
    ],
    expected: {
      kind: 'canonical',
      registryHost: 'nvcr.io',
      project: null,
      imageName: 'nvidia/clara/monai-toolkit',
      tag: '2.4',
      canonical: 'nvcr.io/nvidia/clara/monai-toolkit:2.4',
      submittable: true,
      reason: null,
    },
  },
  {
    id: 'V52',
    input:
      'nvcr.io/nvidia/pytorch@sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    expected: {
      kind: 'canonical',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'digest_unsupported',
    },
  },
  {
    id: 'V53',
    input:
      'nvcr.io/nvidia/pytorch:25.01-py3@sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    expected: {
      kind: 'canonical',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: '25.01-py3',
      canonical: null,
      submittable: false,
      reason: 'digest_unsupported',
    },
  },
  {
    id: 'V54',
    input: 'https://nvcr.io/nvidia/pytorch:25.01-py3',
    expected: {
      kind: 'canonical',
      registryHost: null,
      project: null,
      imageName: null,
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'scheme_in_canonical',
    },
  },
  {
    id: 'V55',
    input: 'nvcr.io/NVIDIA/pytorch:25.01-py3',
    expected: {
      kind: 'canonical',
      registryHost: 'nvcr.io',
      project: null,
      imageName: null,
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'invalid_reference',
    },
  },
  {
    id: 'V56',
    input: 'nvcr.io//nvidia/pytorch:25.01-py3',
    expected: {
      kind: 'canonical',
      registryHost: 'nvcr.io',
      project: null,
      imageName: null,
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'invalid_reference',
    },
  },
  {
    id: 'V57',
    input: 'nvcr.io/nvidia/pytorch/',
    expected: {
      kind: 'canonical',
      registryHost: 'nvcr.io',
      project: null,
      imageName: null,
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'invalid_reference',
    },
  },
  {
    id: 'V58',
    input: 'nvcr.io/',
    expected: {
      kind: 'canonical',
      registryHost: 'nvcr.io',
      project: null,
      imageName: null,
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'empty_image_name',
    },
  },
  {
    id: 'V59',
    input: 'nvcr.io',
    expected: {
      kind: 'canonical',
      registryHost: null,
      project: null,
      imageName: 'nvcr.io',
      tag: null,
      canonical: null,
      submittable: false,
      reason: 'host_required',
    },
  },
  {
    id: 'V60',
    input: 'nvcr.io/nvidia/pytorch:',
    expected: {
      kind: 'canonical',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: '',
      canonical: null,
      submittable: false,
      reason: 'invalid_tag',
    },
  },
  {
    id: 'V61',
    input: 'nvcr.io/nvidia/pytorch:-25.01',
    expected: {
      kind: 'canonical',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: '-25.01',
      canonical: null,
      submittable: false,
      reason: 'invalid_tag',
    },
  },
  {
    id: 'V62',
    input: 'nvcr.io/nvidia/pytorch:25.01-',
    expected: {
      kind: 'canonical',
      registryHost: 'nvcr.io',
      project: 'nvidia',
      imageName: 'pytorch',
      tag: '25.01-',
      canonical: null,
      submittable: false,
      reason: 'invalid_tag',
    },
  },
  {
    id: 'V63',
    input: '   ',
    expected: {
      kind: 'blank',
      registryHost: null,
      project: null,
      imageName: null,
      tag: null,
      canonical: null,
      submittable: false,
      reason: null,
    },
  },
];

describe('parseImageReferenceLine + resolveImageReference', () => {
  it.each(vectors)('$id $input', ({ input, registries, expected }) => {
    expect(run(input, registries ?? DEFAULT_REGISTRIES)).toEqual(expected);
  });

  it('covers every vector of the grammar note', () => {
    expect(vectors).toHaveLength(63);
  });
});

describe('resolveImageReference registry matching', () => {
  const parsed = parseImageReferenceLine(
    'nvcr.io/nvidia/clara/monai-toolkit:2.4',
  );

  it('splits the remote path on the single matching row', () => {
    const resolved = resolveImageReference(parsed, [
      { registry_name: 'nvcr.io', project: 'nvidia' },
    ]);
    expect(resolved.project).toBe('nvidia');
    expect(resolved.imageName).toBe('clara/monai-toolkit');
    expect(resolved.canonical).toBe('nvcr.io/nvidia/clara/monai-toolkit:2.4');
    expect(resolved.submittable).toBe(true);
  });

  it('reports registry_not_registered when no row keys the reference', () => {
    const resolved = resolveImageReference(parsed, [
      { registry_name: 'nvcr.io', project: 'nim' },
    ]);
    expect(resolved.reason).toBe('registry_not_registered');
    expect(resolved.matchedRegistries).toHaveLength(0);
  });

  it('refuses to submit when two rows key the same reference', () => {
    const resolved = resolveImageReference(parsed, [
      { registry_name: 'nvcr.io', project: 'nvidia' },
      { registry_name: 'nvcr.io', project: 'nvidia/clara' },
    ]);
    expect(resolved.reason).toBe('registry_ambiguous');
    expect(resolved.canonical).toBeNull();
    // The longest key describes the preview; both rows are surfaced.
    expect(resolved.project).toBe('nvidia/clara');
    expect(resolved.matchedRegistries).toHaveLength(2);
  });

  it('keeps the whole remote path as the image name on a host-only row', () => {
    const resolved = resolveImageReference(parsed, [
      { registry_name: 'nvcr.io', project: null },
    ]);
    expect(resolved.project).toBeNull();
    expect(resolved.imageName).toBe('nvidia/clara/monai-toolkit');
    expect(resolved.submittable).toBe(true);
  });
});
