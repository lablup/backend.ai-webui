/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import DeploymentAccessTokensCard from './DeploymentAccessTokensCard';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * FR-3679: a disabled "Create Access Token" button must name WHY it is
 * disabled. `t` is identity-mapped, so the assertions read as i18n keys.
 */

vi.mock('react-i18next', async () => {
  const React = await import('react');
  return {
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
      ready: true,
    }),
    Trans: (props: any) => React.createElement('span', null, props.i18nKey),
    initReactI18next: { type: '3rdParty', init: () => {} },
  };
});

const Harness: React.FC<{
  isOwnedByCurrentUser?: boolean;
  isDeploymentDestroying?: boolean;
}> = (props) => {
  const data = useLazyLoadQuery<any>(
    graphql`
      query DeploymentAccessTokensCardTestQuery($deploymentId: ID!) {
        deployment(id: $deploymentId) {
          ...DeploymentAccessTokensCard_deployment
        }
      }
    `,
    { deploymentId: 'deployment-0000' },
  );
  return (
    <DeploymentAccessTokensCard
      deploymentFrgmt={data.deployment}
      deploymentId="deployment-0000"
      {...props}
    />
  );
};

const renderCard = ({
  endpointUrl = 'https://endpoint.example',
  ...props
}: {
  endpointUrl?: string | null;
  isOwnedByCurrentUser?: boolean;
  isDeploymentDestroying?: boolean;
} = {}) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation: any) =>
    MockPayloadGenerator.generate(operation, {
      ModelDeployment: () => ({
        id: btoa('ModelDeployment:deployment-0000'),
        networkAccess: { endpointUrl },
        accessTokens: { count: 0, edges: [] },
      }),
    }),
  );
  render(
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>
        <Harness {...props} />
      </Suspense>
    </RelayEnvironmentProvider>,
  );
};

const createButton = () =>
  screen.getByRole('button', { name: /deployment\.accessToken\.Create/ });

describe('DeploymentAccessTokensCard — disabled create button states (FR-3679)', () => {
  it('names the reason and stays inert when the network endpoint is not issued', async () => {
    renderCard({ endpointUrl: null });

    const button = await waitFor(createButton);
    expect(button).toHaveAttribute('aria-disabled', 'true');
    // The reason is reachable: rendered in the DOM and wired via aria-describedby.
    expect(
      screen.getByText('deployment.accessToken.EndpointNotIssuedYet'),
    ).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-describedby');

    await userEvent.click(button, { pointerEventsCheck: 0 });
    expect(
      screen.queryByText('deployment.accessToken.Expiration'),
    ).not.toBeInTheDocument();
  });

  it('names the ownership reason when the current user is not the owner', async () => {
    renderCard({ isOwnedByCurrentUser: false });

    const button = await waitFor(createButton);
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(
      screen.getByText('deployment.accessToken.OnlyOwnerCanManage'),
    ).toBeInTheDocument();
  });

  it('names the stopped-deployment reason, which outranks the others', async () => {
    renderCard({ endpointUrl: null, isDeploymentDestroying: true });

    const button = await waitFor(createButton);
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(
      screen.getByText('deployment.accessToken.DeploymentStopped'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('deployment.accessToken.EndpointNotIssuedYet'),
    ).not.toBeInTheDocument();
  });

  it('carries no reason and opens the modal when creation is allowed', async () => {
    renderCard();

    const button = await waitFor(createButton);
    expect(button).not.toHaveAttribute('aria-disabled');
    expect(button).not.toBeDisabled();
    expect(
      screen.queryByText('deployment.accessToken.EndpointNotIssuedYet'),
    ).not.toBeInTheDocument();

    await userEvent.click(button);
    expect(await screen.findByRole('dialog')).toHaveTextContent(
      'deployment.accessToken.Expiration',
    );
  });
});
