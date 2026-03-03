import BAIFlex from './BAIFlex';
import { describe, test, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

// Mock antd's theme hook
jest.mock('antd', () => ({
  theme: {
    useToken: () => ({
      token: {
        sizeXXS: 4,
        sizeXS: 8,
        sizeSM: 12,
        sizeMS: 16,
        sizeMD: 20,
        sizeLG: 24,
        sizeXL: 32,
        sizeXXL: 48,
      },
    }),
  },
}));

describe('BAIFlex', () => {
  test('default render', () => {
    const { baseElement } = render(<BAIFlex />);
    expect(baseElement).toMatchSnapshot();
  });

  test('render with custom props', () => {
    const { baseElement } = render(
      <BAIFlex
        direction="column"
        wrap="wrap-reverse"
        justify="center"
        align="start"
        gap="sm"
        style={{ backgroundColor: 'blue' }}
      />,
    );
    expect(baseElement).toMatchSnapshot();
  });

  test('render with children', () => {
    const { baseElement } = render(
      <BAIFlex>
        <div data-testid="firstChildComponent">
          <h1> First Child </h1>
          <div data-testid="nestedChildComponent">
            <h1> Nested Child </h1>
          </div>
        </div>
        <div data-testid="secondChildComponent">
          <h1> Second Child </h1>
        </div>
      </BAIFlex>,
    );

    expect(screen.getByTestId('firstChildComponent')).toBeInTheDocument();
    expect(screen.getByTestId('secondChildComponent')).toBeInTheDocument();
    expect(screen.getByTestId('nestedChildComponent')).toBeInTheDocument();

    expect(baseElement).toMatchSnapshot();
  });
});
