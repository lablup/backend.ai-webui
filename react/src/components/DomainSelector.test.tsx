import DomainSelector from './DomainSelector';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

describe('DomainSelect', () => {
  test('default render', async () => {
    const environment = createMockEnvironment();
    const user = userEvent.setup();
    const { asFragment } = render(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback="loading...">
          <DomainSelector
            title="hello"
            placeholder="Please select domain"
            autoFocus={true}
          />
        </Suspense>
      </RelayEnvironmentProvider>,
    );

    expect(screen.getByText('loading...')).toBeInTheDocument();

    environment.mock.resolveMostRecentOperation((operation) =>
      MockPayloadGenerator.generate(operation, {
        String() {
          return 'abcd';
        },
      }),
    );

    expect(await screen.findByText('Please select domain')).toBeInTheDocument();

    await user.click(screen.getByRole('combobox'));
    expect(screen.getAllByText('abcd')[0]).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });
});
