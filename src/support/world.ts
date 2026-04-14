import { Browser, BrowserContext, Page } from "@playwright/test";
import { IWorldOptions, setWorldConstructor, World } from "@cucumber/cucumber";
import { config } from "../support/config";
import { BaseDashboard } from "@pages/baseDashboard";

export class CustomWorld extends World {
    browser!: Browser;
    context!: BrowserContext;
    page!: Page;
    basePage!: BaseDashboard;
    config = config;
    accessToken: string | undefined;
    baseDashboard!: import("@pages/baseDashboard").BaseDashboard;
    constructor(options: IWorldOptions) {
        super(options);
    }
}

setWorldConstructor(CustomWorld);
