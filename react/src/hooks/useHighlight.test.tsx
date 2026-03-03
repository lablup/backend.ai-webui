import { useHighlight, FALLBACK_LANG } from './useHighlight';
import { useThemeMode } from './useThemeMode';
import { renderHook, waitFor } from '@testing-library/react';
import { useBAILogger } from 'backend.ai-ui';
import { codeToHtml } from 'shiki';

// Mock dependencies
jest.mock('./useThemeMode');
jest.mock('backend.ai-ui', () => ({
  useBAILogger: jest.fn(),
}));
jest.mock('shiki', () => ({
  codeToHtml: jest.fn(),
}));

describe('useHighlight', () => {
  const mockLogger = {
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useBAILogger as jest.Mock).mockReturnValue({ logger: mockLogger });
    (useThemeMode as jest.Mock).mockReturnValue({ isDarkMode: false });
    (codeToHtml as jest.Mock).mockResolvedValue('<code>highlighted</code>');
  });

  describe('Basic Functionality', () => {
    it('should highlight code successfully with valid language', async () => {
      const { result } = renderHook(() =>
        useHighlight('const x = 1;', 'javascript'),
      );

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(codeToHtml).toHaveBeenCalledWith('const x = 1;', {
        lang: 'javascript',
        theme: 'github-light',
      });
      expect(result.current.data).toBe('<code>highlighted</code>');
    });

    it('should use fallback language for unsupported language', async () => {
      const { result } = renderHook(() =>
        useHighlight('some code', 'unsupported-lang'),
      );

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(codeToHtml).toHaveBeenCalledWith('some code', {
        lang: FALLBACK_LANG,
        theme: 'github-light',
      });
    });

    it('should handle empty text', async () => {
      const { result } = renderHook(() => useHighlight('', 'javascript'));

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(codeToHtml).toHaveBeenCalledWith('', {
        lang: 'javascript',
        theme: 'github-light',
      });
    });
  });

  describe('Theme Mode Support', () => {
    it('should use dark theme when dark mode is enabled', async () => {
      (useThemeMode as jest.Mock).mockReturnValue({ isDarkMode: true });

      const { result } = renderHook(() =>
        useHighlight('const x = 1;', 'javascript'),
      );

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(codeToHtml).toHaveBeenCalledWith('const x = 1;', {
        lang: 'javascript',
        theme: 'github-dark',
      });
    });
  });

  describe('Language Case Sensitivity', () => {
    it('should handle lowercase language names', async () => {
      const { result } = renderHook(() =>
        useHighlight('print("hello")', 'python'),
      );

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(result.current.data).toBe('<code>highlighted</code>');
    });
  });

  describe('Supported Languages', () => {
    it('should support common programming languages', async () => {
      const testLanguages = ['javascript', 'typescript', 'python', 'java'];

      for (const lang of testLanguages) {
        jest.clearAllMocks();
        (codeToHtml as jest.Mock).mockResolvedValue('<code>highlighted</code>');

        const { result } = renderHook(() => useHighlight('test code', lang));

        await waitFor(() => expect(result.current.data).toBeDefined());

        expect(codeToHtml).toHaveBeenCalledWith('test code', {
          lang: lang,
          theme: 'github-light',
        });
      }
    });

    it('should support markup languages', async () => {
      const testLanguages = ['html', 'xml', 'markdown', 'yaml'];

      for (const lang of testLanguages) {
        jest.clearAllMocks();
        (codeToHtml as jest.Mock).mockResolvedValue('<code>highlighted</code>');

        const { result } = renderHook(() => useHighlight('test markup', lang));

        await waitFor(() => expect(result.current.data).toBeDefined());

        expect(codeToHtml).toHaveBeenCalledWith('test markup', {
          lang: lang,
          theme: 'github-light',
        });
      }
    });

    it('should support shell scripting languages', async () => {
      const testLanguages = ['bash', 'shell', 'sh'];

      for (const lang of testLanguages) {
        jest.clearAllMocks();
        (codeToHtml as jest.Mock).mockResolvedValue('<code>highlighted</code>');

        const { result } = renderHook(() => useHighlight('echo "test"', lang));

        await waitFor(() => expect(result.current.data).toBeDefined());

        expect(codeToHtml).toHaveBeenCalledWith('echo "test"', {
          lang: lang,
          theme: 'github-light',
        });
      }
    });

    it('should support language aliases', async () => {
      const testAliases = [
        { alias: 'js', expected: 'js' },
        { alias: 'ts', expected: 'ts' },
        { alias: 'py', expected: 'py' },
      ];

      for (const { alias, expected } of testAliases) {
        jest.clearAllMocks();
        (codeToHtml as jest.Mock).mockResolvedValue('<code>highlighted</code>');

        const { result } = renderHook(() => useHighlight('test code', alias));

        await waitFor(() => expect(result.current.data).toBeDefined());

        expect(codeToHtml).toHaveBeenCalledWith('test code', {
          lang: expected,
          theme: 'github-light',
        });
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long code text', async () => {
      const longCode = 'const x = 1;'.repeat(100);

      const { result } = renderHook(() => useHighlight(longCode, 'javascript'));

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(codeToHtml).toHaveBeenCalledWith(longCode, {
        lang: 'javascript',
        theme: 'github-light',
      });
    });

    it('should handle special characters in code', async () => {
      const specialCode = 'const x = "<>&\'"';

      const { result } = renderHook(() =>
        useHighlight(specialCode, 'javascript'),
      );

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(codeToHtml).toHaveBeenCalledWith(specialCode, {
        lang: 'javascript',
        theme: 'github-light',
      });
    });

    it('should handle unicode characters in code', async () => {
      const unicodeCode = 'const 変数 = "日本語";';

      const { result } = renderHook(() =>
        useHighlight(unicodeCode, 'javascript'),
      );

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(codeToHtml).toHaveBeenCalledWith(unicodeCode, {
        lang: 'javascript',
        theme: 'github-light',
      });
    });

    it('should handle multiline code', async () => {
      const multilineCode = `function test() {
  const x = 1;
  return x;
}`;

      const { result } = renderHook(() =>
        useHighlight(multilineCode, 'javascript'),
      );

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(codeToHtml).toHaveBeenCalledWith(multilineCode, {
        lang: 'javascript',
        theme: 'github-light',
      });
    });
  });

  describe('SWR Loading States', () => {
    it('should provide data after successful loading', async () => {
      const { result } = renderHook(() =>
        useHighlight('const x = 789;', 'javascript'),
      );

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(result.current.data).toBe('<code>highlighted</code>');
    });
  });
});
