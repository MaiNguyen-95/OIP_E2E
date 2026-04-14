import { setDefaultTimeout } from "@cucumber/cucumber";
setDefaultTimeout(30 * 1000);

import { Before, After, BeforeAll, AfterAll } from "@cucumber/cucumber";
import { chromium, Browser } from "@playwright/test";
import { CustomWorld } from "./world";
import { BaseDashboard } from "../pages/baseDashboard";

let browser: Browser;

BeforeAll(async function () {
    browser = await chromium.launch({ headless: false });
});

Before(async function (this: CustomWorld) {
    this.context = await browser.newContext({
        extraHTTPHeaders: {
            "x-tenant-id": process.env.TENANT_ID!,
            Origin: process.env.BASE_URL!,
            Referer: process.env.BASE_URL!,
        },
    });

    this.page = await this.context.newPage();
    this.baseDashboard = new BaseDashboard(this.page);

    // 🔥 debug request (có thể xoá sau)
    this.page.on("request", (req) => {
        if (req.url().includes("/overview")) {
            console.log("HEADERS:", req.headers());
        }
    });
});

After(async function (this: CustomWorld) {
    await this.page?.close();
    await this.context?.close();
});

AfterAll(async function () {
    await browser?.close();
});
