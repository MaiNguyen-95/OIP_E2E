//keywords
import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import { expect, chromium, Page, Locator } from "@playwright/test";
import { BaseDashboard } from "../pages/baseDashboard";

Given("user is on dashboard", async function (this: CustomWorld) {
    await this.baseDashboard.goto(this.config.baseUrl);
});

Then("I should see {string} in cart icon", async function (count: string) {
    const cartBadge = this.page.locator(".bg-qa-clr");
    if (count === "0") {
        await expect(cartBadge).toHaveCount(0);
    } else {
        await expect(cartBadge).toHaveText(count);
    }
});

// Fill input
When("I fill input {string} with {string}", async function (inputName: string, value: string) {
    await this.baseDashboard.fillInGeneralInputField(inputName, value);
});

// Click button
When("I click button {string}", async function (text: string) {
    await this.baseDashboard.clickButtonByText(text);
});

//  LẤY MAGIC LINK TỪ OUTLOOK UI
When("I wait for magic link and navigate", { timeout: 120 * 10000 }, async function (this: CustomWorld) {
    const browser = await chromium.launch({ headless: false });
 
    try {
        const context = await browser.newContext({
            storageState: "outlook-auth.json",
        });
 
        const outlookPage = await context.newPage();
        await outlookPage.goto("https://outlook.office.com/mail");
 
        await outlookPage.waitForSelector("div[role='main']", { timeout: 60000 });
 
        let magicLink: string | null = null;
 
        for (let i = 0; i < 12; i++) {
            console.log(`🔁 Checking inbox attempt ${i + 1}`);
 
            await outlookPage.reload();
 
            // ✅ FIX: dùng role option
            await outlookPage.waitForSelector("div[role='option']", { timeout: 20000 });
 
            await outlookPage.waitForTimeout(5000);
 
            const emails = outlookPage.locator("div[role='option']");
            const count = await emails.count();
 
            console.log("📊 Email count:", count);
 
            for (let j = 0; j < count; j++) {
                const email = emails.nth(j);
 
                const text = await email.innerText();
 
                console.log(`📧 Email ${j}:`, text);
 
                if (!text.includes("Login to DVCS Ops Insights")) continue;
 
                console.log("✅ Found login email");
 
                await email.click();
 
                await outlookPage.waitForSelector("text=We've received a login request");
 
                const linkElement = outlookPage.locator("a:has-text('Log In')");
                await linkElement.waitFor({ state: "visible", timeout: 30000 });
 
                magicLink = await linkElement.getAttribute("href");
                break;
            }
 
            if (magicLink) break;
 
            console.log("⏳ Chưa có mail login...");
            await outlookPage.waitForTimeout(5000);
        }
 
        if (!magicLink) {
            throw new Error("❌ Không tìm thấy magic link mới");
        }
 
        console.log("🔗 MAGIC LINK:", magicLink);
 
        await this.page.goto(magicLink, {
            waitUntil: "domcontentloaded",
        });
 
        await this.page.waitForLoadState("networkidle");
    } finally {
        await browser.close();
    }
});
 
// Verify text
Then("user should be on dashboard", async function () {
    await this.page.waitForURL(`${process.env.BASE_URL}/en-us/dashboard?countryCode=gh`);
});
When("I click button to select tenant", async function () {
    await this.baseDashboard.clickButtonBycombobox();
});

When("I selects tenant {string}", async function (tenant: string) {
    await this.baseDashboard.selectOptionFromCombobox(tenant);
    await this.page.waitForTimeout(3000);
});

//Choose project filter
When("I select {string} filter project {string}", async function (area: string, project: string) {
    await this.baseDashboard.selectFilterProject(area, project);
    await this.page.waitForTimeout(3000);
});

//Chọn thời gian latency
When("I select latency time {string}", async function (latencyText: string) {
    await this.baseDashboard.selectLatencyTime(latencyText);
    await this.page.waitForTimeout(3000);
});

//Show popup all services
When("I click view all services", async function () {
    await this.baseDashboard.clickViewAllServices();
    await this.page.waitForTimeout(3000);
});

//Đóng popup
When("I click close view all services", async function () {
    await this.baseDashboard.clickCloseViewAllServices();
    await this.page.waitForTimeout(3000);
});

//Chọn time range filter
When("I select last result {string}", async function (lastResultText: string) {
    await this.baseDashboard.selectLastResult(lastResultText);
    await this.page.waitForTimeout(3000);
});

//Chọn filter module theo các tình trạng nếu có value > 0
When("I click status modules if they have value", async function () {
    const priority = ["PASSING MODULES", "DEGRADED MODULES", "FAILED MODULES"];

    for (const status of priority) {
        console.log(`\n🔍 Checking: ${status}`);

        // luôn re-locate mỗi vòng lặp
        const container = this.page.locator(`//button[.//div[contains(text(),'${status}')]]`).first();

        // check tồn tại giá trị > 0, nếu không có element hoặc value = 0 thì skip
        if ((await container.count()) === 0) {
            console.log(`❌ Not found: ${status}`);
            continue;
        }

        // đảm bảo visible + scroll
        await container.waitFor({ state: "visible", timeout: 2000 });
        await container.scrollIntoViewIfNeeded();

        // lấy value
        const valueElement = container
            .locator("div")
            .filter({
                hasText: /^[0-9,]+$/,
            })
            .first();

        const valueText = await valueElement.textContent();
        const value = parseInt((valueText || "0").replace(/,/g, ""));

        if (value > 0) {
            console.log(`✅ Click ${status} (${value})`);

            // re-query lại trước khi click (tránh stale DOM)
            const freshContainer = this.page.locator(`//button[.//div[contains(text(),'${status}')]]`).first();

            await freshContainer.waitFor({ state: "visible", timeout: 2000 });
            await freshContainer.scrollIntoViewIfNeeded();

            // click
            await freshContainer.click();

            //  wait sau mỗi lần chọn filter để dashboard load lại
            await this.page.waitForTimeout(2000);
        } else {
            console.log(`⏭ Skip ${status} (${value})`);
        }
    }
});
