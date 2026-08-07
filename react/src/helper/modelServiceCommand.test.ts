/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DEFAULT_MODEL_SERVICE_SHELL,
  deriveCommandModeState,
  resolveCommandShell,
} from './modelServiceCommand';

describe('deriveCommandModeState', () => {
  it('returns Shell mode with the default shell when no command and no startCommand exist', () => {
    expect(deriveCommandModeState({})).toEqual({
      command: '',
      execution: 'shell',
      shell: DEFAULT_MODEL_SERVICE_SHELL,
    });
    expect(
      deriveCommandModeState({ command: null, startCommand: null }),
    ).toEqual({
      command: '',
      execution: 'shell',
      shell: DEFAULT_MODEL_SERVICE_SHELL,
    });
    expect(deriveCommandModeState({ command: null, startCommand: [] })).toEqual(
      {
        command: '',
        execution: 'shell',
        shell: DEFAULT_MODEL_SERVICE_SHELL,
      },
    );
  });

  it('reconstructs a legacy startCommand list as Exec (argv, no shell)', () => {
    expect(
      deriveCommandModeState({ startCommand: ['python', 'service.py'] }),
    ).toEqual({
      command: 'python service.py',
      execution: 'exec',
      shell: DEFAULT_MODEL_SERVICE_SHELL,
    });
  });

  it('treats an empty new command as absent and falls back to startCommand (Exec)', () => {
    expect(
      deriveCommandModeState({ command: '', startCommand: ['vllm', 'serve'] }),
    ).toEqual({
      command: 'vllm serve',
      execution: 'exec',
      shell: DEFAULT_MODEL_SERVICE_SHELL,
    });
  });

  it('treats an empty-string shell as Exec (no shell wrapping)', () => {
    expect(
      deriveCommandModeState({ command: 'vllm serve /models', shell: '' }),
    ).toEqual({
      command: 'vllm serve /models',
      execution: 'exec',
      shell: DEFAULT_MODEL_SERVICE_SHELL,
    });
  });

  it('maps a null shell to Exec (no shell)', () => {
    expect(
      deriveCommandModeState({ command: 'vllm serve /models', shell: null }),
    ).toEqual({
      command: 'vllm serve /models',
      execution: 'exec',
      shell: DEFAULT_MODEL_SERVICE_SHELL,
    });
  });

  it('maps the default shell (/bin/bash) to Shell mode', () => {
    expect(
      deriveCommandModeState({
        command: 'vllm serve /models',
        shell: DEFAULT_MODEL_SERVICE_SHELL,
      }),
    ).toEqual({
      command: 'vllm serve /models',
      execution: 'shell',
      shell: DEFAULT_MODEL_SERVICE_SHELL,
    });
  });

  it('maps a custom shell to Shell mode, preserving the shell value', () => {
    expect(
      deriveCommandModeState({
        command: 'vllm serve /models',
        shell: '/bin/zsh',
      }),
    ).toEqual({
      command: 'vllm serve /models',
      execution: 'shell',
      shell: '/bin/zsh',
    });
  });

  it('prefers the new command over the deprecated startCommand when both are present', () => {
    const state = deriveCommandModeState({
      command: 'new command',
      shell: DEFAULT_MODEL_SERVICE_SHELL,
      startCommand: ['old', 'tokens'],
    });
    expect(state.command).toBe('new command');
  });
});

describe('resolveCommandShell', () => {
  it('returns null for Exec (no shell wrapping)', () => {
    expect(
      resolveCommandShell({
        execution: 'exec',
        shell: '/bin/zsh',
      }),
    ).toBeNull();
  });

  it('returns the selected shell for Shell mode', () => {
    expect(
      resolveCommandShell({
        execution: 'shell',
        shell: '/bin/zsh',
      }),
    ).toBe('/bin/zsh');
  });

  it('falls back to the default shell when Shell mode has an empty value', () => {
    expect(resolveCommandShell({ execution: 'shell', shell: '  ' })).toBe(
      DEFAULT_MODEL_SERVICE_SHELL,
    );
  });

  it('treats an omitted execution (preset path) as Shell, never null', () => {
    expect(resolveCommandShell({ shell: '/bin/zsh' })).toBe('/bin/zsh');
    expect(resolveCommandShell({})).toBe(DEFAULT_MODEL_SERVICE_SHELL);
  });
});
