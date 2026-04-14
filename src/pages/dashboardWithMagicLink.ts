// file: dashboardWithMagicLink.ts
import { chromium, Browser } from "playwright";
import * as dotenv from "dotenv";

dotenv.config();

const outlookEmail = process.env.OUTLOOK_EMAIL!;
const outlookPassword = process.env.OUTLOOK_PASSWORD!;

export async function getLatestMagicLinkFromOutlook(browser: Browser, triggerTime: number): Promise<string> {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("https://outlook.office.com/mail");

    // Login
    await page.fill('input[type="email"]', outlookEmail);
    await page.click('input[type="submit"]');
    await page.waitForSelector('input[type="password"]', { timeout: 20000 });
    await page.fill('input[type="password"]', outlookPassword);
    await page.click('input[type="submit"]');

    // Stay signed in
    try {
        const stayBtn = page.locator('input[value="Yes"]');
        if (await stayBtn.isVisible({ timeout: 5000 })) await stayBtn.click();
    } catch {}

    // Chờ inbox load
    await page.waitForSelector("div[role='main']", { timeout: 60000 });

    let latestMailItem: any = null;
    let latestTime = 0;
    const maxWait = 30000; // tối đa 30s polling
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
        // Lấy tất cả mail có "log In" trong subject
        const mailRows = await page.locator("div[role='row']").evaluateAll((rows) => {
            return rows
                .map((row) => {
                    const text = (row as HTMLElement).innerText || "";
                    const titleEl = row.querySelector("span[title]") || row.querySelector("span[aria-label]");
                    const time = titleEl ? new Date(titleEl.getAttribute("title") || titleEl.getAttribute("aria-label") || "").getTime() : 0;
                    return { row, text, time };
                })
                .filter((m) => m.text.includes("log In"));
        });

        for (const mail of mailRows) {
            if (mail.time >= triggerTime && mail.time > latestTime) {
                latestTime = mail.time;
                latestMailItem = mail.row;
            }
        }

        if (latestMailItem) break;

        // Chưa có mail mới → refresh inbox
        await page.reload();
        await page.waitForTimeout(2000);
    }

    if (!latestMailItem) {
        await context.close();
        throw new Error("Không tìm thấy mail login mới nhất");
    }

    await latestMailItem.click();

    const magicLink = await page.locator("a[href*='magic-link']").first().getAttribute("href");
    if (!magicLink) {
        await context.close();
        throw new Error("Không tìm thấy magic link");
    }

    await context.close();
    return magicLink;
}
