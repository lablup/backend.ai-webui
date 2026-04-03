/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  parseExtraArgs,
  serializeExtraArgs,
  mergeExtraArgs,
  reverseMapExtraArgs,
} from './runtimeExtraArgsParser';

describe('parseExtraArgs', () => {
  it('should parse --flag value pairs', () => {
    const result = parseExtraArgs('--temperature 0.7 --top-p 0.9');
    expect(result.knownArgs).toEqual({
      '--temperature': '0.7',
      '--top-p': '0.9',
    });
    expect(result.unknownTokens).toEqual([]);
  });

  it('should parse --flag=value pairs', () => {
    const result = parseExtraArgs('--temperature=0.7 --dtype=float16');
    expect(result.knownArgs).toEqual({
      '--temperature': '0.7',
      '--dtype': 'float16',
    });
  });

  it('should parse bool flags (--flag alone)', () => {
    const result = parseExtraArgs('--enforce-eager --trust-remote-code');
    expect(result.knownArgs).toEqual({
      '--enforce-eager': 'true',
      '--trust-remote-code': 'true',
    });
  });

  it('should parse --no-flag as false', () => {
    const result = parseExtraArgs('--no-enforce-eager');
    expect(result.knownArgs).toEqual({
      '--enforce-eager': 'false',
    });
  });

  it('should handle last-wins for duplicate keys', () => {
    const result = parseExtraArgs('--temperature 0.5 --temperature 0.8');
    expect(result.knownArgs['--temperature']).toBe('0.8');
  });

  it('should handle last-wins for --flag and --no-flag', () => {
    const result = parseExtraArgs('--enforce-eager --no-enforce-eager');
    expect(result.knownArgs['--enforce-eager']).toBe('false');
  });

  it('should preserve short options as unknown tokens', () => {
    const result = parseExtraArgs('-f -abc --temperature 0.7');
    expect(result.knownArgs).toEqual({ '--temperature': '0.7' });
    expect(result.unknownTokens).toEqual(['-f', '-abc']);
  });

  it('should handle quoted values', () => {
    const result = parseExtraArgs(
      '--chat-template "path with spaces/template.jinja"',
    );
    expect(result.knownArgs['--chat-template']).toBe(
      'path with spaces/template.jinja',
    );
  });

  it('should handle mixed syntax', () => {
    const result = parseExtraArgs(
      '--temperature=0.7 --max-model-len 4096 --enforce-eager --no-trust-remote-code -v',
    );
    expect(result.knownArgs).toEqual({
      '--temperature': '0.7',
      '--max-model-len': '4096',
      '--enforce-eager': 'true',
      '--trust-remote-code': 'false',
    });
    expect(result.unknownTokens).toEqual(['-v']);
  });

  it('should handle empty input', () => {
    const result = parseExtraArgs('');
    expect(result.knownArgs).toEqual({});
    expect(result.unknownTokens).toEqual([]);
  });

  it('should handle whitespace-only input', () => {
    const result = parseExtraArgs('   ');
    expect(result.knownArgs).toEqual({});
    expect(result.unknownTokens).toEqual([]);
  });

  it('should handle orphaned values as unknown tokens', () => {
    const result = parseExtraArgs('orphan --temperature 0.7');
    expect(result.knownArgs).toEqual({ '--temperature': '0.7' });
    expect(result.unknownTokens).toEqual(['orphan']);
  });

  it('should handle --flag=value with spaces in value', () => {
    const result = parseExtraArgs('--chat-template="my template"');
    expect(result.knownArgs['--chat-template']).toBe('my template');
  });
});

describe('serializeExtraArgs', () => {
  it('should serialize key-value pairs', () => {
    const result = serializeExtraArgs({
      '--temperature': '0.7',
      '--top-p': '0.9',
    });
    expect(result).toBe('--temperature 0.7 --top-p 0.9');
  });

  it('should serialize bool true as flag-only', () => {
    const result = serializeExtraArgs({ '--enforce-eager': 'true' });
    expect(result).toBe('--enforce-eager');
  });

  it('should omit bool false flags', () => {
    const result = serializeExtraArgs({
      '--enforce-eager': 'false',
      '--temperature': '0.7',
    });
    expect(result).toBe('--temperature 0.7');
  });

  it('should quote values with spaces', () => {
    const result = serializeExtraArgs({
      '--chat-template': 'path with spaces',
    });
    expect(result).toBe('--chat-template "path with spaces"');
  });

  it('should append unknown tokens', () => {
    const result = serializeExtraArgs({ '--temperature': '0.7' }, ['-v', '-f']);
    expect(result).toBe('--temperature 0.7 -v -f');
  });

  it('should handle empty args', () => {
    expect(serializeExtraArgs({})).toBe('');
  });
});

describe('mergeExtraArgs', () => {
  it('should merge UI and manual args (manual wins on conflict)', () => {
    const uiArgs = { '--temperature': '0.7', '--top-p': '0.9' };
    const manualInput = '--temperature 0.5 --max-model-len 4096';
    const result = mergeExtraArgs(uiArgs, manualInput);
    expect(result).toContain('--temperature 0.5');
    expect(result).toContain('--top-p 0.9');
    expect(result).toContain('--max-model-len 4096');
  });

  it('should exclude values matching defaults', () => {
    const uiArgs = { '--temperature': '1.0', '--top-p': '0.9' };
    const manualInput = '';
    const defaults = { '--temperature': '1.0' };
    const result = mergeExtraArgs(uiArgs, manualInput, defaults);
    expect(result).not.toContain('--temperature');
    expect(result).toContain('--top-p 0.9');
  });

  it('should preserve unknown tokens from manual input', () => {
    const uiArgs = { '--temperature': '0.7' };
    const manualInput = '-v --dtype float16';
    const result = mergeExtraArgs(uiArgs, manualInput);
    expect(result).toContain('--temperature 0.7');
    expect(result).toContain('--dtype float16');
    expect(result).toContain('-v');
  });

  it('should handle empty manual input', () => {
    const uiArgs = { '--temperature': '0.7' };
    const result = mergeExtraArgs(uiArgs, '');
    expect(result).toBe('--temperature 0.7');
  });

  it('should handle empty UI args', () => {
    const result = mergeExtraArgs({}, '--temperature 0.7');
    expect(result).toBe('--temperature 0.7');
  });

  it('should handle both empty', () => {
    const result = mergeExtraArgs({}, '');
    expect(result).toBe('');
  });
});

describe('reverseMapExtraArgs', () => {
  it('should split args into mapped and unmapped', () => {
    const schemaKeys = new Set(['--temperature', '--top-p']);
    const result = reverseMapExtraArgs(
      '--temperature 0.7 --max-model-len 4096 --top-p 0.9',
      schemaKeys,
    );
    expect(result.mappedArgs).toEqual({
      '--temperature': '0.7',
      '--top-p': '0.9',
    });
    expect(result.unmappedText).toContain('--max-model-len 4096');
  });

  it('should handle all args mapped', () => {
    const schemaKeys = new Set(['--temperature']);
    const result = reverseMapExtraArgs('--temperature 0.7', schemaKeys);
    expect(result.mappedArgs).toEqual({ '--temperature': '0.7' });
    expect(result.unmappedText).toBe('');
  });

  it('should handle no args mapped', () => {
    const schemaKeys = new Set(['--temperature']);
    const result = reverseMapExtraArgs('--max-model-len 4096', schemaKeys);
    expect(result.mappedArgs).toEqual({});
    expect(result.unmappedText).toContain('--max-model-len 4096');
  });

  it('should preserve unknown tokens in unmapped text', () => {
    const schemaKeys = new Set(['--temperature']);
    const result = reverseMapExtraArgs(
      '--temperature 0.7 -v orphan',
      schemaKeys,
    );
    expect(result.mappedArgs).toEqual({ '--temperature': '0.7' });
    expect(result.unmappedText).toContain('-v');
    expect(result.unmappedText).toContain('orphan');
  });

  it('should handle empty input', () => {
    const result = reverseMapExtraArgs('', new Set());
    expect(result.mappedArgs).toEqual({});
    expect(result.unmappedText).toBe('');
  });
});
