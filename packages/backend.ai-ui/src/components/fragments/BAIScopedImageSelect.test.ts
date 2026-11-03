/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { toImageNameSearch } from './BAIScopedImageSelect';
import { describe, expect, it } from 'vitest';

describe('toImageNameSearch', () => {
  const name = 'cr.example.com/stable/python:3.11-ubuntu22.04';

  it('drops a trailing @architecture', () => {
    expect(toImageNameSearch(`${name}@x86_64`)).toBe(name);
    expect(toImageNameSearch(`${name}@aarch64`)).toBe(name);
  });

  it('drops a partially typed architecture', () => {
    expect(toImageNameSearch(`${name}@`)).toBe(name);
    expect(toImageNameSearch(`${name}@x86`)).toBe(name);
  });

  it('trims surrounding whitespace', () => {
    expect(toImageNameSearch(`  ${name}@x86_64\n`)).toBe(name);
    expect(toImageNameSearch('  python  ')).toBe('python');
    expect(toImageNameSearch('python @x86_64')).toBe('python');
  });

  it('keeps a value without an architecture suffix', () => {
    expect(toImageNameSearch('python')).toBe('python');
    expect(toImageNameSearch(name)).toBe(name);
  });

  it('keeps an @ that is followed by a path or a tag', () => {
    expect(toImageNameSearch('team@org/python')).toBe('team@org/python');
    expect(toImageNameSearch('python@sha256:abc')).toBe('python@sha256:abc');
  });

  it('returns an empty term when only the suffix is left', () => {
    expect(toImageNameSearch('@x86_64')).toBe('');
    expect(toImageNameSearch('   ')).toBe('');
  });
});
