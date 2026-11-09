import BAIFetchKeyButton from './BAIFetchKeyButton';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('BAIFetchKeyButton', () => {
  // The dropdown variant routes the text through the button's own `tooltip`
  // (see `refreshButton`), so each branch needs its own check (#10967).
  it.each([
    ['without the interval dropdown', {}],
    [
      'with the interval dropdown and auto-refresh off',
      { autoUpdateDelay: null, onChangeAutoUpdateDelay: () => {} },
    ],
    [
      'with the interval dropdown and auto-refresh on',
      { autoUpdateDelay: 15_000, onChangeAutoUpdateDelay: () => {} },
    ],
  ])('shows the Refresh tooltip on hover %s', async (_, props) => {
    const user = userEvent.setup();
    render(<BAIFetchKeyButton onChange={() => {}} {...props} />);

    await user.hover(screen.getByRole('button', { name: 'Refresh' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Refresh');
  });
});
