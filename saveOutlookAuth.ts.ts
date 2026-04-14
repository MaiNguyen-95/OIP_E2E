/// <reference types="node" />
import { chromium } from "@playwright/test";

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("https://outlook.office.com");

    console.log("👉 Login Outlook xong thì nhấn Enter...");
    await new Promise((resolve) => process.stdin.once("data", resolve));

    await context.storageState({ path: "outlook-auth.json" });

    console.log("✅ Saved outlook-auth.json");

    await browser.close();
})();
