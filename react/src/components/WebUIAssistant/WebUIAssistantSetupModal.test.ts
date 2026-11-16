/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { sortAssistantCards } from './WebUIAssistantSetupModal';

const card = (name: string, task: string | null, label: string[] = []) =>
  ({
    id: name,
    name,
    metadata: { title: null, description: null, task, label },
    ' $fragmentSpreads': {},
  }) as unknown as Parameters<typeof sortAssistantCards>[0][number];

describe('sortAssistantCards', () => {
  it('puts the recommended card first, then chat models, then the rest by name', () => {
    const sorted = sortAssistantCards([
      card('whisper', 'automatic-speech-recognition'),
      card('qwen', 'text-generation'),
      card('bge', 'feature-extraction'),
      card('llama', 'text-generation', ['webui-assistant']),
    ]);
    expect(sorted.map((c) => c.name)).toEqual([
      'llama',
      'qwen',
      'bge',
      'whisper',
    ]);
  });
});
