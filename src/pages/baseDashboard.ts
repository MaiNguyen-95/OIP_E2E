// file: dashboardWithMagicLink.ts
import { chromium, Page, expect, Locator } from 'playwright/test';
import * as imaps from 'imap-simple';
import * as dotenv from 'dotenv';

dotenv.config(); // Load variables from .env

export class BaseDashboard {
  static selectTenant(tenantName: string) {
    throw new Error('Method not implemented.');
  }
  protected page: Page;
  readonly tenantDropdown: Locator;
  constructor(page: Page) {
    this.page = page;
    this.page = page;
    this.tenantDropdown = page.locator('button[data-testid="tenant-dropdown"]');
    this.page.setDefaultTimeout(30_000);
  }

  //#region Locators
  menuItem = (item: string) =>
    this.page.locator(`xpath=(//ul[@role="menu"]//li[@role="menuitem"]//span[contains(text(),"${item}")])`);
  btnByText = (text: string) => this.page.locator(`xpath=(//button[@type="submit" and normalize-space()="${text}"])`);
  txtGeneralInputField = (name: string) => this.page.locator(`xpath=//input[@name='${name}']`);
  selectById = (id: string) => this.page.locator(`select#${id}`);
  optionByText = (selectId: string, optionText: string) =>
    this.page.locator(`xpath=//select[@id='${selectId}']/option[normalize-space()='${optionText}']`);
  linkByText = (text: string) => this.page.locator(`xpath=(//a[normalize-space(text())="${text}"])`);
  btnByflag = (text: string) =>
    this.page.locator(`xpath=(//button[@type="button" and @role="combobox" and @aria-controls="radix-:rdjq:"])`);
  btnBytenant = (tenant: string) => this.page.locator(`xpath=(.//div[@role="option" and .//span[text()='${tenant}']])`);
  btncombobox = (name: string) =>
    this.page.locator(
      `xpath=(//button[@type="button" and @role="combobox"]//span[@style="pointer-events: none;"]//div[@class="flex items-center gap-2 pr-2"])`,
    );
  btnChooseProject = (project: string) =>
    this.page.locator(`//div[@data-testid="${project}"]// button[@role="combobox"]`);
  optionChooseProject = (option: string) =>
    this.page.locator(`//div[@role="option"]//span[normalize-space()="${option}"]`);
  btnLatencyTime = (text: string) =>
    this.page.locator(`//div[@data-testid="latency-section"]//button[normalize-space()="${text}"]`);
  btnViewAllservices = () => this.page.locator(`//button[text()="View all services"]`);
  btnClose = () => this.page.locator(`//div[@role='dialog']//button[.//span[text()='Close']]`);
  iconInfo = () => this.page.locator(`//svg[contains(@class,'lucide-info')]`);
  btnLastResult = (text: string) =>
    this.page.locator(`//div[@data-testid="last-results-filter"]//button[normalize-space()="${text}"]`);
  btnFilterModules = (text: string) => this.page.locator(`//button[.//div[normalize-space()='${text}']]`);
  projectRow = (text: string) => this.page.locator(`//span[normalize-space()='${text}']/ancestor::button`);
  moduleRow = (text: string) =>
    this.page.locator(`//span[contains(normalize-space(),'${text}')]/ancestor::button[@type='button']`);
  moduleClick = (text: string) =>
    this.page.locator(`//span[@class='ml-2 cursor-pointer text-left' and contains(normalize-space(),'${text}')]`);
  subModuleRow = (moduleName: string, subModuleName: string) =>
    this.moduleRow(moduleName)
      .locator(`xpath=ancestor::div[contains(@class,'border-b')]`)
      .locator(`//span[@class='cursor-pointer' and normalize-space()='${subModuleName}']`);

  // Bar chart of module
  barChartModule = (moduleName: string, index: number) =>
    this.moduleRow(moduleName)
      .locator('xpath=ancestor::div[contains(@class,"items-center p-0")]')
      .locator('div.cursor-pointer')
      .nth(index);

  // Bar chart of sub-module
  barChartSubModule = (moduleName: string, subModuleName: string, index: number) =>
    this.subModuleRow(moduleName, subModuleName)
      .locator('xpath=ancestor::div[contains(@class,"items-center p-0")]')
      .locator('div.cursor-pointer')
      .nth(index);

  // Locators
  clickFilterModule = (moduleName: string, statType: string) =>
    this.moduleRow(moduleName)
      .locator('xpath=ancestor::div[contains(@class,"items-center p-0")]')
      .locator('div.cursor-pointer.rounded')
      .nth(['passing', 'degraded', 'failed'].indexOf(statType.toLowerCase()));

  clickFilterSubModule = (moduleName: string, subModuleName: string, statType: string) =>
    this.subModuleRow(moduleName, subModuleName)
      .locator('xpath=ancestor::div[contains(@class,"items-center p-0")]')
      .locator('div.cursor-pointer.rounded')
      .nth(['passing', 'degraded', 'failed'].indexOf(statType.toLowerCase()));

  //#endregion

  //#region Actions
  async goto(url: string): Promise<void> {
    await this.page.goto(url);
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectTextVisible(text: string): Promise<void> {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  async clickDropdown(text: string) {
    const dropdown = this.btnByflag(text);
    await dropdown.waitFor({ state: 'visible' });
    await dropdown.click();
  }

  async selectDropdownByText(selectId: string, optionText: string | null): Promise<void> {
    if (!optionText) return;
    const select = this.page.locator(`select#${selectId}`);
    await select.waitFor({ state: 'visible' });
    await select.selectOption({ label: optionText });
  }

  // click button function
  async clickButtonByText(text: string): Promise<void> {
    const button = this.btnByText(text);
    await button.waitFor({ state: 'visible', timeout: 10000 });
    await button.click();
  }

  async clickButtonBycombobox(text: string): Promise<void> {
    const button = this.btncombobox(text);
    await button.waitFor({ state: 'visible', timeout: 5000 });
    await button.click();
  }

  // New helper: fill email
  async fillInGeneralInputField(nameOrId: string, value: string | null) {
    if (!value) return;
    const input = this.txtGeneralInputField(nameOrId);
    await input.waitFor({ state: 'visible' });
    await input.fill(value);
  }

  //Choose tenant
  async selectOptionFromCombobox(optionText: string): Promise<void> {
    const option = this.page.locator(`text=${optionText}`);
    await option.waitFor({ state: 'visible', timeout: 30000 });
    await option.click();
  }

  //Choose project filter
  async selectFilterProject(area: string, project: string): Promise<void> {
    const button = this.btnChooseProject(area);
    await button.waitFor({ state: 'visible', timeout: 30000 });
    await button.click();

    const option = this.optionChooseProject(project);
    await option.waitFor({ state: 'visible', timeout: 30000 });
    await option.click();
  }

  //Choose time range latency
  async selectLatencyTime(text: string): Promise<void> {
    const button = this.btnLatencyTime(text);
    await button.waitFor({ state: 'visible', timeout: 3000 });
    await button.click();
  }

  //Show popup all services
  async clickViewAllServices(): Promise<void> {
    const button = this.btnViewAllservices();
    await button.waitFor({ state: 'visible', timeout: 3000 });
    await button.click();
  }
  //Close popup all services
  async clickCloseViewAllServices(): Promise<void> {
    const button = this.btnClose();
    await button.waitFor({ state: 'visible', timeout: 3000 });
    await button.click();
  }

  //Choose filter module  if value > 0
  async selectFilterModule(text: string): Promise<void> {
    const button = this.btnFilterModules(text);
    await button.waitFor({ state: 'visible', timeout: 3000 });
    await button.click();
  }

  async selectLastResult(text: string): Promise<void> {
    const button = this.btnLastResult(text);
    await button.waitFor({ state: 'visible', timeout: 3000 });
    await button.click();
  }
  //check value !=0
  async clickstatus(status: string): Promise<void> {
    const container = this.page.locator(`//div[.//div[text()='${status}']]`);
    const valueLocator = container.locator('div').filter({ hasText: /^\d+$/ }).first();

    const valueText = await valueLocator.textContent();
    const value = parseInt(valueText || '0');

    if (value > 0) {
      console.log(`${status} has data: ${value} → click`);
      await container.click();
    } else {
      console.log(`${status} has NO data → skip`);
    }
  }
  //click status: PASSING MODULES, DEGRADED MODULES, FAILED MODULES
  async clickModulesByPriority(): Promise<void> {
    const priority = ['PASSING MODULES', 'DEGRADED MODULES', 'FAILED MODULES'];

    for (const status of priority) {
      await this.clickstatus(status);
      await this.page.waitForTimeout(10000); // add delay after clicking to allow UI to update
    }
  }

  // action for project details
  async expandProject(text: string): Promise<void> {
    const btn = this.projectRow(text);
    await btn.waitFor({ state: 'visible', timeout: 5000 });
    const state = await btn.getAttribute('data-state');
    if (state !== 'open') {
      await btn.click();
      await this.page.waitForTimeout(3000);
    }
  }

  async collapseProject(text: string): Promise<void> {
    const btn = this.projectRow(text);
    await btn.waitFor({ state: 'visible', timeout: 5000 });
    const state = await btn.getAttribute('data-state');
    if (state === 'open') {
      await btn.click();
      await this.page.waitForTimeout(3000);
    }
  }

  //Action for module
  async expandModule(text: string): Promise<void> {
    const btn = this.moduleRow(text);
    await btn.waitFor({ state: 'visible', timeout: 3000 });
    const state = await btn.getAttribute('data-state');
    if (state !== 'open') {
      await btn.click();
      await this.page.waitForTimeout(3000);
    }
  }

  async collapseModule(text: string): Promise<void> {
    const btn = this.moduleRow(text);
    await btn.waitFor({ state: 'visible', timeout: 3000 });
    const state = await btn.getAttribute('data-state');
    if (state === 'open') {
      await btn.click();
      await this.page.waitForTimeout(3000);
    }
  }

  async clickModule(text: string): Promise<void> {
    const module = this.moduleRow(text);
    await module.waitFor({ state: 'visible', timeout: 3000 });
    await module.click();
    await this.page.waitForTimeout(3000);
  }

  // Click sub- module

  async clickSubModule(moduleName: string, subModuleName: string): Promise<void> {
    const sub = this.subModuleRow(moduleName, subModuleName);
    await sub.waitFor({ state: 'visible', timeout: 3000 });
    await sub.click();
    await this.page.waitForTimeout(3000);
  }

  // Click bar chart
  async clickBarChartModule(moduleName: string, index: number): Promise<void> {
    const bar = this.barChartModule(moduleName, index);
    await bar.waitFor({ state: 'visible', timeout: 3000 });
    await bar.click();
    await this.page.waitForTimeout(3000);
  }

  async clickBarChartSubModule(moduleName: string, subModuleName: string, index: number): Promise<void> {
    const bar = this.barChartSubModule(moduleName, subModuleName, index);
    await bar.waitFor({ state: 'visible', timeout: 3000 });
    await bar.click();
    await this.page.waitForTimeout(3000);
  }

  // Click filter module/sub-module
  async clickFilterIfHasValue(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: 8000 });
    const isClickable = await locator.evaluate((el) => !el.classList.contains('cursor-not-allowed'));
    if (isClickable) {
      await locator.click();
      await this.page.waitForTimeout(3000);
    }
  }

  async FilterModule(moduleName: string, statType: string): Promise<void> {
    await this.clickFilterIfHasValue(this.clickFilterModule(moduleName, statType));
  }

  async FilterSubModule(moduleName: string, subModuleName: string, statType: string): Promise<void> {
    await this.clickFilterIfHasValue(this.clickFilterSubModule(moduleName, subModuleName, statType));
  }

  //#endregion
}

//#endregion
1;
