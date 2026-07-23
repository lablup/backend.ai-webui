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
  it('reconstructs a legacy startCommand list as Exec (argv, no shell)', () => {
    expect(
      deriveCommandModeState({ startCommand: ['python', 'service.py'] }),
    ).toEqual({
      command: 'python service.py',
      advanced: true,
      execution: 'exec',
      shell: DEFAULT_MODEL_SERVICE_SHELL,
    });
  });

  it('treats an empty new command as absent and falls back to startCommand (Exec)', () => {
    expect(
      deriveCommandModeState({ command: '', startCommand: ['vllm', 'serve'] }),
    ).toEqual({
      command: 'vllm serve',
      advanced: true,
      execution: 'exec',
      shell: DEFAULT_MODEL_SERVICE_SHELL,
    });
  });

  it('treats an empty-string shell as Exec (no shell wrapping)', () => {
    expect(
      deriveCommandModeState({ command: 'vllm serve /models', shell: '' }),
    ).toEqual({
      command: 'vllm serve /models',
      advanced: true,
      execution: 'exec',
      shell: DEFAULT_MODEL_SERVICE_SHELL,
    });
  });

  it('maps a null shell to Advanced + Exec (no shell)', () => {
    expect(
      deriveCommandModeState({ command: 'vllm serve /models', shell: null }),
    ).toEqual({
      command: 'vllm serve /models',
      advanced: true,
      execution: 'exec',
      shell: DEFAULT_MODEL_SERVICE_SHELL,
    });
  });

  it('maps the default shell (/bin/bash) to Basic', () => {
    expect(
      deriveCommandModeState({
        command: 'vllm serve /models',
        shell: DEFAULT_MODEL_SERVICE_SHELL,
      }),
    ).toEqual({
      command: 'vllm serve /models',
      advanced: false,
      execution: 'shell',
      shell: DEFAULT_MODEL_SERVICE_SHELL,
    });
  });

  it('maps a custom shell to Advanced + Shell, preserving the shell value', () => {
    expect(
      deriveCommandModeState({
        command: 'vllm serve /models',
        shell: '/bin/zsh',
      }),
    ).toEqual({
      command: 'vllm serve /models',
      advanced: true,
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
  it('omits the shell in Basic mode so the backend applies its own default', () => {
    expect(
      resolveCommandShell({ advanced: false, shell: '/bin/zsh' }),
    ).toBeUndefined();
  });

  it('returns null for Advanced + Exec (no shell wrapping)', () => {
    expect(
      resolveCommandShell({
        advanced: true,
        execution: 'exec',
        shell: '/bin/zsh',
      }),
    ).toBeNull();
  });

  it('returns the selected shell for Advanced + Shell', () => {
    expect(
      resolveCommandShell({
        advanced: true,
        execution: 'shell',
        shell: '/bin/zsh',
      }),
    ).toBe('/bin/zsh');
  });

  it('falls back to the default shell when Advanced + Shell has an empty value', () => {
    expect(
      resolveCommandShell({ advanced: true, execution: 'shell', shell: '  ' }),
    ).toBe(DEFAULT_MODEL_SERVICE_SHELL);
  });

  it('treats an omitted execution (preset path) as Shell, never null', () => {
    expect(resolveCommandShell({ advanced: true, shell: '/bin/zsh' })).toBe(
      '/bin/zsh',
    );
    expect(resolveCommandShell({ advanced: true })).toBe(
      DEFAULT_MODEL_SERVICE_SHELL,
    );
  });
});
