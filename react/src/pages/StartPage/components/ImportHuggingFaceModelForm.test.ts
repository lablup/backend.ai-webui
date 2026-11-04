import { parseHuggingFaceModel } from './ImportHuggingFaceModelForm';
import { describe, expect, it } from 'vitest';

describe('parseHuggingFaceModel', () => {
  it('parses an org/name model ID', () => {
    expect(parseHuggingFaceModel('openai/gpt-oss-20b')).toEqual({
      modelId: 'openai/gpt-oss-20b',
    });
  });

  it('parses a single-segment model ID', () => {
    expect(parseHuggingFaceModel('gpt2')).toEqual({ modelId: 'gpt2' });
  });

  it('parses a model URL', () => {
    expect(
      parseHuggingFaceModel('https://huggingface.co/openai/gpt-oss-20b'),
    ).toEqual({ modelId: 'openai/gpt-oss-20b' });
  });

  it('parses a model URL with trailing slash and www host', () => {
    expect(
      parseHuggingFaceModel('https://www.huggingface.co/openai/gpt-oss-20b/'),
    ).toEqual({ modelId: 'openai/gpt-oss-20b' });
  });

  it('extracts the revision from a /tree/ URL', () => {
    expect(
      parseHuggingFaceModel(
        'https://huggingface.co/openai/gpt-oss-20b/tree/main',
      ),
    ).toEqual({ modelId: 'openai/gpt-oss-20b', revision: 'main' });
  });

  it('extracts the revision from a single-segment /tree/ URL', () => {
    expect(
      parseHuggingFaceModel('https://huggingface.co/gpt2/tree/v1.0'),
    ).toEqual({ modelId: 'gpt2', revision: 'v1.0' });
  });

  it('trims surrounding whitespace', () => {
    expect(parseHuggingFaceModel('  openai/gpt-oss-20b  ')).toEqual({
      modelId: 'openai/gpt-oss-20b',
    });
  });

  it('rejects empty input', () => {
    expect(parseHuggingFaceModel('')).toBeNull();
    expect(parseHuggingFaceModel('   ')).toBeNull();
  });

  it('rejects non-huggingface hosts', () => {
    expect(
      parseHuggingFaceModel('https://github.com/openai/gpt-oss-20b'),
    ).toBeNull();
    expect(
      parseHuggingFaceModel('https://evil-huggingface.co/openai/model'),
    ).toBeNull();
  });

  it('rejects non-model huggingface URLs', () => {
    expect(
      parseHuggingFaceModel('https://huggingface.co/datasets/openai/data'),
    ).toBeNull();
    expect(
      parseHuggingFaceModel('https://huggingface.co/spaces/foo/bar'),
    ).toBeNull();
    expect(parseHuggingFaceModel('https://huggingface.co/')).toBeNull();
  });

  it('rejects IDs with more than two segments or invalid characters', () => {
    expect(parseHuggingFaceModel('a/b/c')).toBeNull();
    expect(parseHuggingFaceModel('org/name; rm -rf /')).toBeNull();
    expect(parseHuggingFaceModel("org/na'me")).toBeNull();
  });
});
