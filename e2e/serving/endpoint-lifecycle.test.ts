import { EndpointPage } from '../../utils/classes/serving/EndpointPage';
import { loginAsAdmin, navigateTo } from '../../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe(
  'Endpoint Lifecycle Management',
  { tag: ['@critical', '@serving'] },
  () => {
    let endpointPage: EndpointPage;
    let createdEndpointId: string;

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'serving');
      endpointPage = new EndpointPage(page);
      await endpointPage.verifyPageLoaded();
    });

    test.afterEach(async () => {
      // Cleanup: delete created endpoint if it exists
      if (createdEndpointId) {
        try {
          const exists =
            await endpointPage.verifyEndpointExists(createdEndpointId);
          if (exists) {
            await endpointPage.deleteEndpoint(createdEndpointId);
          }
        } catch {
          // Endpoint might already be deleted
        }
      }
    });

    test('Create service endpoint successfully', async () => {
      // Create endpoint with basic configuration
      const endpointName = `test-endpoint-${Date.now()}`;
      createdEndpointId = await endpointPage.createEndpoint({
        name: endpointName,
        cpu: 1,
        memory: '1g',
      });

      // Verify endpoint was created
      const exists = await endpointPage.verifyEndpointExists(endpointName);
      expect(exists).toBeTruthy();

      // Verify endpoint is in active lifecycle stage
      await endpointPage.filterByLifecycleStage('active');
      const activeEndpoints = await endpointPage.getVisibleEndpointIds();
      expect(activeEndpoints).toContain(endpointName);
    });

    test('Update endpoint configuration', async () => {
      // Create endpoint
      const endpointName = `test-endpoint-${Date.now()}`;
      createdEndpointId = await endpointPage.createEndpoint({
        name: endpointName,
        cpu: 1,
        memory: '1g',
      });

      // Wait for endpoint to be active
      await endpointPage.waitForEndpointActive(endpointName);

      // Update endpoint configuration
      await endpointPage.updateEndpoint(endpointName, {
        cpu: 2,
        memory: '2g',
      });

      // Verify endpoint still exists after update
      const exists = await endpointPage.verifyEndpointExists(endpointName);
      expect(exists).toBeTruthy();
    });

    test('Monitor endpoint status and lifecycle stages', async () => {
      // Create endpoint
      const endpointName = `test-endpoint-${Date.now()}`;
      createdEndpointId = await endpointPage.createEndpoint({
        name: endpointName,
        cpu: 1,
        memory: '1g',
      });

      // Wait for endpoint to become active
      await endpointPage.waitForEndpointActive(endpointName, 120000);

      // Get endpoint status
      const status = await endpointPage.getEndpointStatus(endpointName);
      expect(status).toBeTruthy();

      // Get lifecycle stage
      const lifecycleStage =
        await endpointPage.getEndpointLifecycleStage(endpointName);
      expect(lifecycleStage).toBeTruthy();
      expect(lifecycleStage.toLowerCase()).not.toBe('destroyed');
    });

    test('Delete endpoint successfully', async () => {
      // Create endpoint
      const endpointName = `test-endpoint-${Date.now()}`;
      createdEndpointId = await endpointPage.createEndpoint({
        name: endpointName,
        cpu: 1,
        memory: '1g',
      });

      // Verify endpoint exists
      let exists = await endpointPage.verifyEndpointExists(endpointName);
      expect(exists).toBeTruthy();

      // Delete endpoint
      await endpointPage.deleteEndpoint(endpointName);

      // Verify endpoint is no longer in active list
      await endpointPage.filterByLifecycleStage('active');
      const activeEndpoints = await endpointPage.getVisibleEndpointIds();
      expect(activeEndpoints).not.toContain(endpointName);

      // Check if endpoint is in destroyed state
      await endpointPage.filterByLifecycleStage('all');
      exists = await endpointPage.verifyEndpointExists(endpointName);

      if (exists) {
        const lifecycleStage =
          await endpointPage.getEndpointLifecycleStage(endpointName);
        expect(lifecycleStage.toLowerCase()).toBe('destroyed');
      }

      // Clear cleanup flag since we already deleted it
      createdEndpointId = '';
    });

    test('Filter endpoints by lifecycle stage', async () => {
      // Create endpoint
      const endpointName = `test-endpoint-${Date.now()}`;
      createdEndpointId = await endpointPage.createEndpoint({
        name: endpointName,
        cpu: 1,
        memory: '1g',
      });

      // Filter by active lifecycle
      await endpointPage.filterByLifecycleStage('active');
      let visibleEndpoints = await endpointPage.getVisibleEndpointIds();
      expect(visibleEndpoints).toContain(endpointName);

      // Filter by all (should still contain our endpoint)
      await endpointPage.filterByLifecycleStage('all');
      visibleEndpoints = await endpointPage.getVisibleEndpointIds();
      expect(visibleEndpoints).toContain(endpointName);
    });

    test('Create endpoint with environment variables', async () => {
      // Create endpoint with environment variables
      const endpointName = `test-endpoint-env-${Date.now()}`;
      createdEndpointId = await endpointPage.createEndpoint({
        name: endpointName,
        cpu: 1,
        memory: '1g',
        environment: {
          TEST_VAR: 'test_value',
          API_KEY: 'dummy_key',
        },
      });

      // Verify endpoint was created
      const exists = await endpointPage.verifyEndpointExists(endpointName);
      expect(exists).toBeTruthy();
    });

    test('Handle endpoint creation validation errors', async ({ page }) => {
      // Try to create endpoint with invalid/missing required fields
      await endpointPage.navigateToCreateEndpoint();

      // Try to submit without filling required fields
      const submitButton = page.getByRole('button', {
        name: /create|submit/i,
      });
      await submitButton.click();

      // Verify validation error is shown
      const errorMessage = page.locator(
        '[class*="error"], [role="alert"], .ant-form-item-explain-error',
      );
      const hasError = await errorMessage.count();
      expect(hasError).toBeGreaterThan(0);

      // Clear the attempt flag since no endpoint was created
      createdEndpointId = '';
    });
  },
);
