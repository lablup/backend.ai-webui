import useErrorMessageResolver from './useErrorMessageResolver';
import { renderHook } from '@testing-library/react';

// Partial mock: keep every real export from `react-i18next` (notably
// `initReactI18next`, which BUI's `locale/index.ts` consumes at import
// time) and only override `useTranslation` so the default fallback is a
// stable, recognizable string. A wholesale `vi.mock` factory would erase
// the other exports and break any module that transitively pulls them in
// (FR-2986: `useBAIi18n` imports `locale` which calls
// `i18n.use(initReactI18next)`).
vi.mock('react-i18next', async () => {
  const actual =
    await vi.importActual<typeof import('react-i18next')>('react-i18next');
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
    }),
  };
});

const useGetErrorMessage = () => {
  const { getErrorMessage } = useErrorMessageResolver();
  return getErrorMessage;
};

describe('useErrorMessageResolver', () => {
  it('returns the default message for nullish / non-object errors', () => {
    const { result } = renderHook(() => useGetErrorMessage());
    const getErrorMessage = result.current;

    expect(getErrorMessage(undefined)).toBe('error.UnknownError');
    expect(getErrorMessage(null)).toBe('error.UnknownError');
    expect(getErrorMessage('boom')).toBe('error.UnknownError');
    expect(getErrorMessage(undefined, 'fallback')).toBe('fallback');
  });

  it('prefers the GraphQL error detail over the generic client message', () => {
    const { result } = renderHook(() => useGetErrorMessage());
    const getErrorMessage = result.current;

    // Shape thrown by the Backend.AI client for an HTTP 400 from /admin/gql:
    // the top-level `message` only says "... - undefined" while the real
    // detail lives in `response.errors`.
    const error = {
      isError: true,
      statusCode: 400,
      title: '400 Bad Request - undefined',
      message: 'server responded failure: 400 Bad Request - undefined',
      response: {
        errors: [
          {
            message:
              'Variable "$input" got invalid value; Field "options" of required type "PurgeVFolderOptionsInput!" was not provided.',
          },
        ],
      },
    };

    expect(getErrorMessage(error)).toBe(
      'Variable "$input" got invalid value; Field "options" of required type "PurgeVFolderOptionsInput!" was not provided.',
    );
  });

  it('joins multiple GraphQL error messages with a newline', () => {
    const { result } = renderHook(() => useGetErrorMessage());
    const getErrorMessage = result.current;

    const error = {
      message: 'server responded failure: 400 Bad Request - undefined',
      response: {
        errors: [{ message: 'First problem.' }, { message: 'Second problem.' }],
      },
    };

    expect(getErrorMessage(error)).toBe('First problem.\nSecond problem.');
  });

  it('falls back to msg / message / title when no GraphQL detail is present', () => {
    const { result } = renderHook(() => useGetErrorMessage());
    const getErrorMessage = result.current;

    expect(getErrorMessage({ msg: 'a friendly message' })).toBe(
      'a friendly message',
    );
    expect(getErrorMessage({ message: 'a deprecated message' })).toBe(
      'a deprecated message',
    );
    expect(getErrorMessage({ title: 'a title' })).toBe('a title');
  });

  it('ignores an empty GraphQL errors array and uses the next available field', () => {
    const { result } = renderHook(() => useGetErrorMessage());
    const getErrorMessage = result.current;

    expect(
      getErrorMessage({
        message: 'fallback message',
        response: { errors: [] },
      }),
    ).toBe('fallback message');
    expect(
      getErrorMessage({
        message: 'fallback message',
        response: { errors: [{ message: '' }] },
      }),
    ).toBe('fallback message');
  });

  it('ignores a non-array errors field and falls back', () => {
    const { result } = renderHook(() => useGetErrorMessage());
    const getErrorMessage = result.current;

    expect(
      getErrorMessage({
        message: 'fallback message',
        // Malformed body where `errors` is not an array.
        response: { errors: 'boom' } as never,
      }),
    ).toBe('fallback message');
  });

  it('appends the error_code when present', () => {
    const { result } = renderHook(() => useGetErrorMessage());
    const getErrorMessage = result.current;

    expect(
      getErrorMessage({ msg: 'something failed', error_code: 'E_FOO' }),
    ).toBe('something failed (E_FOO)');
  });
});
