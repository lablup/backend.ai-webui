import { getCardByHeaderText, InputLocator } from '../test-util-antd';
import { EnvironmentsVersion, ResourceAllocation } from './LauncherFormItems';
import { expect, Locator, Page } from '@playwright/test';

export type SessionLauncherStepType =
  | 'Session Type'
  | 'Environments & Resource allocation'
  | 'Data & Storage'
  | 'Network'
  | 'Confirm and Launch';

export const SessionLauncherStep: {
  [key in SessionLauncherStepType]: number;
} = {
  'Session Type': 0,
  'Environments & Resource allocation': 1,
  'Data & Storage': 2,
  Network: 3,
  'Confirm and Launch': 4,
};

export type BriefSession = {
  sessionType: 'interactive' | 'batch';
  startupCommand?: string;
  sessionName?: string;
  environment?: string;
  resourceGroup?: string;
  resourcePreset?: string;
  storage?: string;
};

type EnvVersionType =
  | {
      environment: string;
      version?: string;
      imageName?: never;
    }
  | {
      environment?: never;
      version?: never;
      imageName: string;
    };

export class SessionLauncherPage {
  private readonly page: Page;
  private readonly stepContainer: Locator;
  private currentStep: number | null;
  constructor(page: Page) {
    this.page = page;
    this.stepContainer = page.getByTestId('neo-session-launcher-tour-step');
    this.currentStep = null;
  }

  private validateStep(targetStep: number) {
    // TODO: it will be more comfortable if this becomes a decorator.
    if (this.currentStep === null) {
      throw new Error(
        'Current step is not set. Please call setCurrentStep before this method.',
      );
    }
    if (this.currentStep !== targetStep) {
      const stepList = Object.keys(SessionLauncherStep);
      throw new Error(
        `Current step is ${stepList[this.currentStep]}, expected ${stepList[targetStep]}`,
      );
    }
  }

  async createSession({ ...session }: BriefSession): Promise<void> {
    await this.setCurrentStep('Session Type');
    await this.getSessionTypeRadioButton(session.sessionType).click();
    expect(this.getSessionTypeRadioButton(session.sessionType)).toBeChecked();
    await this.page.waitForLoadState('networkidle');
    if (session.sessionName) {
      await this.getSessionNameInput().fill(session.sessionName);
      await expect(this.getSessionNameInput()).toHaveValue(session.sessionName);
    }
    if (session.sessionType === 'batch') {
      if (!session.startupCommand) {
        throw new Error('Batch session requires a startup command.');
      }
      await this.getStartupCommandInput().fill(session.startupCommand);
      await expect(this.getStartupCommandInput()).toHaveValue(
        session.startupCommand,
      );
    }

    await this.setCurrentStep('Environments & Resource allocation');
    if (session.environment) {
      await this.setEnvironmentsAndVersion({
        environment: session.environment,
      });
    }

    await this.setCurrentStep('Data & Storage');
    // TODO: Implement data and storage step.
    await this.setCurrentStep('Network');
    // TODO: Implement network step.
    await this.setCurrentStep('Confirm and Launch');
    await this.launchSession();
    if (!session.storage) {
      const modal = this.page.locator(
        '.ant-modal-content:has-text("No storage folder is mounted")',
      );
      await expect(modal).toBeVisible();
      await modal.getByRole('button', { name: 'Start' }).click();
    }
  }

  async setCurrentStep(step: SessionLauncherStepType): Promise<void> {
    if (
      this.currentStep === SessionLauncherStep[step] ||
      (this.currentStep === null && SessionLauncherStep[step] === 0)
    ) {
      this.currentStep = SessionLauncherStep[step];
      return;
    }
    await this.stepContainer
      .locator(`.ant-steps-item:has-text("${step}")`)
      .click();
    await this.page.waitForLoadState('networkidle');
    const urlPattern = new RegExp(
      `\\/session\\/start.*step=${SessionLauncherStep[step]}`,
    );
    await expect(this.page).toHaveURL(urlPattern);
    this.currentStep = SessionLauncherStep[step];
  }

  getCurrentStep(): null | number {
    return this.currentStep;
  }

  async skipToReview(): Promise<void> {
    await this.page.getByRole('button', { name: 'Skip to Review' }).click();
  }

  async launchSession(): Promise<void> {
    await this.setCurrentStep('Confirm and Launch');
    await this.page.getByTestId('session-launch-button').click();
  }

  getSessionTypeRadioButton(sessionType: 'interactive' | 'batch'): Locator {
    this.validateStep(0);
    const card = getCardByHeaderText(this.page, 'Session Type');
    return card.getByLabel(sessionType);
  }

  getSessionNameInput(): Locator {
    this.validateStep(0);
    const card = getCardByHeaderText(this.page, 'Session Type');
    const sessionNameInput = new InputLocator({
      parent: card,
      label: 'Session name',
    });
    return sessionNameInput.getInput();
  }

  getStartupCommandInput(): Locator {
    this.validateStep(0);
    const card = getCardByHeaderText(this.page, 'Batch mode Configuration');
    expect(card).toBeVisible();
    const startupCommandInput = new InputLocator({
      parent: card,
      label: 'Startup Command',
    });
    return startupCommandInput.getInput();
  }

  async setEnvironmentsAndVersion({
    environment,
    version,
    imageName,
  }: EnvVersionType): Promise<void> {
    this.validateStep(1);
    const card = getCardByHeaderText(this.page, 'Environments');
    const environmentsVersion = new EnvironmentsVersion(this.page, card);
    if (environment) {
      await environmentsVersion.selectEnvironments(environment);
      if (version) {
        await environmentsVersion.selectVersion(version);
      }
    } else {
      // imageName won't be undefined here
      await environmentsVersion.getImageNameInput().fill(imageName as string);
      await expect(environmentsVersion.getImageNameInput()).toHaveValue(
        imageName as string,
      );
    }
  }

  async setResourceAllocation(
    resourceGroup?: string,
    resourcePreset?: string,
  ): Promise<void> {
    this.validateStep(1);
    if (resourceGroup === undefined && resourcePreset === undefined) {
      return;
    }
    const card = getCardByHeaderText(this.page, 'Resource allocation');
    const resourceAllocation = new ResourceAllocation(this.page, card);
    if (resourceGroup) {
      await resourceAllocation.selectResourceGroup(resourceGroup);
    }
    if (resourcePreset) {
      await resourceAllocation.selectResourcePreset(resourcePreset);
    }
  }
}
