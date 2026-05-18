//keywords
import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { expect, chromium, Page, Locator } from '@playwright/test';
import { BaseDashboard } from '../pages/baseDashboard';

Given('user is on dashboard', async function (this: CustomWorld) {
  await this.baseDashboard.goto(this.config.baseUrl);
});

Then('I should see {string} in cart icon', async function (count: string) {
  const cartBadge = this.page.locator('.bg-qa-clr');
  if (count === '0') {
    await expect(cartBadge).toHaveCount(0);
  } else {
    await expect(cartBadge).toHaveText(count);
  }
});

// Fill input
When('I fill input {string} with {string}', async function (inputName: string, value: string) {
  await this.baseDashboard.fillInGeneralInputField(inputName, value);
});

// Click button
When('I click button {string}', async function (text: string) {
  await this.baseDashboard.clickButtonByText(text);
});

//  Get MAGIC LINK from OUTLOOK UI
When('I wait for magic link and navigate', { timeout: 120 * 10000 }, async function (this: CustomWorld) {
  const browser = await chromium.launch({ headless: false });

  try {
    const context = await browser.newContext({
      storageState: 'outlook-auth.json',
    });

    const outlookPage = await context.newPage();
    await outlookPage.goto('https://outlook.office.com/mail');

    await outlookPage.waitForSelector("div[role='main']", { timeout: 60000 });

    let magicLink: string | null = null;

    for (let i = 0; i < 12; i++) {
      console.log(`🔁 Checking inbox attempt ${i + 1}`);

      await outlookPage.reload();

      // ✅ FIX: dùng role option
      await outlookPage.waitForSelector("div[role='option']", {
        timeout: 20000,
      });

      await outlookPage.waitForTimeout(5000);

      const emails = outlookPage.locator("div[role='option']");
      const count = await emails.count();

      console.log('📊 Email count:', count);

      for (let j = 0; j < count; j++) {
        const email = emails.nth(j);

        const text = await email.innerText();

        console.log(`📧 Email ${j}:`, text);

        if (!text.includes('Login to DVCS Ops Insights')) continue;

        console.log('✅ Found login email');

        await email.click();

        await outlookPage.waitForSelector("text=We've received a login request");

        const linkElement = outlookPage.locator("a:has-text('Log In')");
        await linkElement.waitFor({ state: 'visible', timeout: 30000 });

        magicLink = await linkElement.getAttribute('href');
        break;
      }

      if (magicLink) break;

      console.log('⏳ Chưa có mail login...');
      await outlookPage.waitForTimeout(5000);
    }

    if (!magicLink) {
      throw new Error('❌ Not found magic link');
    }

    console.log('🔗 MAGIC LINK:', magicLink);

    await this.page.goto(magicLink, {
      waitUntil: 'domcontentloaded',
    });

    await this.page.waitForLoadState('networkidle');
  } finally {
    await browser.close();
  }
});

// Verify text
Then('user should be on dashboard', async function () {
  await this.page.waitForURL(`${process.env.BASE_URL}/en-us/dashboard?countryCode=gh`);
});
When('I click button to select tenant', async function () {
  await this.baseDashboard.clickButtonBycombobox();
});

When('I selects tenant {string}', async function (tenant: string) {
  await this.baseDashboard.selectOptionFromCombobox(tenant);
  await this.page.waitForTimeout(3000);
});

//Choose project filter
When('I select {string} filter project {string}', async function (area: string, project: string) {
  await this.baseDashboard.selectFilterProject(area, project);
  await this.page.waitForTimeout(3000);
});

//Chọn thời gian latency
When('I select latency time {string}', async function (latencyText: string) {
  await this.baseDashboard.selectLatencyTime(latencyText);
  await this.page.waitForTimeout(3000);
});

//Show popup all services
When('I click view all services', async function () {
  await this.baseDashboard.clickViewAllServices();
  await this.page.waitForTimeout(3000);
});

//Close popup
When('I click close view all services', async function () {
  await this.baseDashboard.clickCloseViewAllServices();
  await this.page.waitForTimeout(3000);
});

//Choose time range filter
When('I select last result {string}', async function (lastResultText: string) {
  await this.baseDashboard.selectLastResult(lastResultText);
  await this.page.waitForTimeout(3000);
});

//Choose filter module if value > 0
When('I click status modules if they have value', async function () {
  const priority = ['PASSING MODULES', 'DEGRADED MODULES', 'FAILED MODULES'];

  for (const status of priority) {
    console.log(`\n🔍 Checking: ${status}`);

    // re-locate each time
    const container = this.page.locator(`//button[.//div[contains(text(),'${status}')]]`).first();

    if ((await container.count()) === 0) {
      console.log(`❌ Not found: ${status}`);
      continue;
    }

    // Ensure visible + scroll
    await container.waitFor({ state: 'visible', timeout: 2000 });
    await container.scrollIntoViewIfNeeded();

    // Get value
    const valueElement = container
      .locator('div')
      .filter({
        hasText: /^[0-9,]+$/,
      })
      .first();

    const valueText = await valueElement.textContent();
    const value = parseInt((valueText || '0').replace(/,/g, ''));

    if (value > 0) {
      console.log(`✅ Click ${status} (${value})`);

      // re-query before click
      const freshContainer = this.page.locator(`//button[.//div[contains(text(),'${status}')]]`).first();

      await freshContainer.waitFor({ state: 'visible', timeout: 2000 });
      await freshContainer.scrollIntoViewIfNeeded();

      // click
      await freshContainer.click();

      //  wait after each filter-> dashboard reload
      await this.page.waitForTimeout(2000);
    } else {
      console.log(`⏭ Skip ${status} (${value})`);
    }
  }
});

// Expand project
When('I expand project {string}', async function (projectName: string) {
  await this.baseDashboard.expandProject(projectName);
  await this.page.waitForTimeout(3000);
});

// Collapse project
When('I collapse project {string}', async function (projectName: string) {
  await this.baseDashboard.collapseProject(projectName);
  await this.page.waitForTimeout(3000);
});

// Expand module
When('I expand module {string}', async function (module: string) {
  await this.baseDashboard.expandModule(module);
  await this.page.waitForTimeout(3000);
});

// Collapse module
When('I collapse module {string}', async function (module: string) {
  await this.baseDashboard.collapseModule(module);
  await this.page.waitForTimeout(3000);
});

//Click Module
When('I click module {string}', async function (module: string) {
  await this.baseDashboard.clickModule(module);
  await this.page.waitForTimeout(3000);
});

//Click sub-module
When('I click submodule {string} in module {string}', async function (subModule: string, module: string) {
  await this.baseDashboard.expandModule(module);
  await this.baseDashboard.clickSubModule(module, subModule);
  await this.page.waitForTimeout(3000);
});

//Click bar chart
When('I click bar chart {int} of module {string}', async function (index: number, module: string) {
  await this.baseDashboard.clickBarChartModule(module, index);
});

When(
  'I click bar chart {int} of submodule {string} in module {string}',
  async function (index: number, subModule: string, module: string) {
    await this.baseDashboard.clickBarChartSubModule(module, subModule, index);
  },
);

//Click filer module/sub-module
When('I click {string} filter box of module {string}', async function (statType: string, module: string) {
  await this.baseDashboard.FilterModule(module, statType);
  await this.page.waitForTimeout(3000);
});

When(
  'I click {string} filter box of submodule {string} in module {string}',
  async function (statType: string, subModule: string, module: string) {
    await this.baseDashboard.FilterSubModule(module, subModule, statType);
    await this.page.waitForTimeout(3000);
  },
);
