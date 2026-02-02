import { BasePage } from '../base/BasePage';
import { Page } from '@playwright/test';

export interface EndpointConfig {
  name: string;
  model?: string;
  resourceGroup?: string;
  desired?: number;
  cpu?: number;
  memory?: string;
  environment?: Record<string, string>;
}

export type LifecycleStage = 'active' | 'destroyed' | 'all';

/**
 * Page Object Model for Serving/Endpoint Page
 * Handles endpoint lifecycle operations and monitoring
 */
export class EndpointPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async verifyPageLoaded(): Promise<void> {
    // Verify endpoint list table is visible
    const endpointTable = this.page.locator(
      'vaadin-grid, [class*="endpoint-list"]',
    );
    await this.waitForVisible(endpointTable);
  }

  /**
   * Navigate to create endpoint page
   */
  async navigateToCreateEndpoint(): Promise<void> {
    const createButton = this.page.getByRole('button', {
      name: /create|new.*endpoint/i,
    });
    await createButton.click();
    await this.waitForNetworkIdle();
  }

  /**
   * Create a new service endpoint
   */
  async createEndpoint(config: EndpointConfig): Promise<string> {
    await this.navigateToCreateEndpoint();

    // Fill endpoint name
    const nameInput = this.page.getByLabel(/endpoint.*name|name/i);
    await this.fillInput(nameInput, config.name);

    // Select model if specified
    if (config.model) {
      const modelSelect = this.page.getByLabel(/model/i);
      await modelSelect.click();
      const modelOption = this.page.getByRole('option', {
        name: new RegExp(config.model, 'i'),
      });
      await modelOption.click();
    }

    // Configure resources if specified
    if (config.cpu) {
      const cpuInput = this.page.getByLabel(/cpu/i);
      await this.fillInput(cpuInput, config.cpu.toString());
    }

    if (config.memory) {
      const memoryInput = this.page.getByLabel(/memory/i);
      await this.fillInput(memoryInput, config.memory);
    }

    // Set environment variables if specified
    if (config.environment) {
      for (const [key, value] of Object.entries(config.environment)) {
        await this.addEnvironmentVariable(key, value);
      }
    }

    // Submit form
    const submitButton = this.page.getByRole('button', {
      name: /create|submit/i,
    });
    await submitButton.click();

    // Wait for creation to complete
    await this.waitForNetworkIdle();

    // Return endpoint ID/name
    return config.name;
  }

  /**
   * Add environment variable to endpoint configuration
   */
  private async addEnvironmentVariable(
    key: string,
    value: string,
  ): Promise<void> {
    const addEnvButton = this.page.getByRole('button', {
      name: /add.*environment|add.*env/i,
    });
    await addEnvButton.click();

    // Fill key and value in the newly added row
    const envRows = this.page.locator('[class*="env-var-row"]');
    const lastRow = envRows.last();

    const keyInput = lastRow.getByPlaceholder(/key|name/i);
    await this.fillInput(keyInput, key);

    const valueInput = lastRow.getByPlaceholder(/value/i);
    await this.fillInput(valueInput, value);
  }

  /**
   * Update endpoint configuration
   */
  async updateEndpoint(
    endpointId: string,
    config: Partial<EndpointConfig>,
  ): Promise<void> {
    // Find endpoint row
    const endpointRow = this.page.locator(
      `vaadin-grid-cell-content:has-text("${endpointId}")`,
    );
    await this.waitForVisible(endpointRow);

    // Click edit button
    const editButton = endpointRow.locator('[icon="create"], [class*="edit"]');
    await editButton.click();

    // Update fields
    if (config.cpu) {
      const cpuInput = this.page.getByLabel(/cpu/i);
      await this.fillInput(cpuInput, config.cpu.toString());
    }

    if (config.memory) {
      const memoryInput = this.page.getByLabel(/memory/i);
      await this.fillInput(memoryInput, config.memory);
    }

    if (config.desired) {
      const desiredInput = this.page.getByLabel(/desired|replicas/i);
      await this.fillInput(desiredInput, config.desired.toString());
    }

    // Save changes
    const saveButton = this.page.getByRole('button', {
      name: /save|update/i,
    });
    await saveButton.click();
    await this.waitForNetworkIdle();
  }

  /**
   * Delete an endpoint
   */
  async deleteEndpoint(endpointId: string): Promise<void> {
    const endpointRow = this.page.locator(
      `vaadin-grid-cell-content:has-text("${endpointId}")`,
    );
    await this.waitForVisible(endpointRow);

    // Click delete button
    const deleteButton = endpointRow.locator(
      '[icon="delete"], [class*="delete"]',
    );
    await deleteButton.click();

    // Confirm deletion
    const confirmButton = this.page.getByRole('button', {
      name: /ok|confirm|yes|delete/i,
    });
    await confirmButton.click();
    await this.waitForNetworkIdle();
  }

  /**
   * Get endpoint status
   */
  async getEndpointStatus(endpointId: string): Promise<string> {
    const endpointRow = this.page.locator(
      `vaadin-grid-cell-content:has-text("${endpointId}")`,
    );
    await this.waitForVisible(endpointRow);

    const statusBadge = endpointRow.locator(
      'lablup-shields, [class*="status"]',
    );
    return await this.getTextContent(statusBadge);
  }

  /**
   * Get endpoint lifecycle stage
   */
  async getEndpointLifecycleStage(endpointId: string): Promise<string> {
    const endpointRow = this.page.locator(
      `vaadin-grid-cell-content:has-text("${endpointId}")`,
    );
    await this.waitForVisible(endpointRow);

    const lifecycleCell = endpointRow.locator('[class*="lifecycle"]');
    return await this.getTextContent(lifecycleCell);
  }

  /**
   * Filter endpoints by lifecycle stage
   */
  async filterByLifecycleStage(stage: LifecycleStage): Promise<void> {
    const filterButton = this.page.getByRole('button', {
      name: new RegExp(stage, 'i'),
    });
    await filterButton.click();
    await this.waitForNetworkIdle();
  }

  /**
   * Get all visible endpoint IDs
   */
  async getVisibleEndpointIds(): Promise<string[]> {
    const endpointCells = this.page.locator(
      'vaadin-grid-cell-content[class*="endpoint-name"]',
    );
    const count = await endpointCells.count();

    const endpointIds: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await endpointCells.nth(i).textContent();
      if (text) {
        endpointIds.push(text.trim());
      }
    }

    return endpointIds;
  }

  /**
   * Verify endpoint exists
   */
  async verifyEndpointExists(endpointId: string): Promise<boolean> {
    const endpointRow = this.page.locator(
      `vaadin-grid-cell-content:has-text("${endpointId}")`,
    );
    return await this.isVisible(endpointRow);
  }

  /**
   * Wait for endpoint to reach active state
   */
  async waitForEndpointActive(
    endpointId: string,
    timeout = 60000,
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const status = await this.getEndpointStatus(endpointId);

      if (status.toLowerCase().includes('active')) {
        return;
      }

      await this.page.waitForTimeout(2000);
    }

    throw new Error(
      `Timeout waiting for endpoint ${endpointId} to become active`,
    );
  }
}
