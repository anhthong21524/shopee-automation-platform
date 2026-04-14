import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser, BrowserContext, Cookie, Page } from 'playwright';

const SHOPEE_SEARCH_URL = 'https://shopee.vn/search?keyword=';
const SHOPEE_HOME_URL = 'https://shopee.vn/';
const MAX_RETRIES = 2;
const TIMEOUT_MS = 60_000;
const PRODUCT_CARD_SELECTOR = '.shopee-search-item-result__item, [data-sqe="item"]';
const DEFAULT_TARGET_PRODUCT_COUNT = 20;
const MAX_SCROLL_STEPS = 20;
const MAX_STABLE_SCROLL_ROUNDS = 3;
const DEFAULT_BROWSER_SLOW_MO_MS = 250;

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export interface RawProduct {
  title: string;
  price: string;
  originalPrice: string;
  imageUrl: string;
  url: string;
  rating: string;
  sold: string;
  shopName: string;
}

export interface CrawlResult {
  type: 'dom';
  products: RawProduct[];
}

/** Parse SHOPEE_COOKIES env var (JSON array of Playwright Cookie objects) */
function loadShopeeCoookies(): Cookie[] {
  const raw = process.env.SHOPEE_COOKIES;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Cookie[]) : [];
  } catch {
    return [];
  }
}

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  async crawlSearchPage(keyword: string, targetCount = DEFAULT_TARGET_PRODUCT_COUNT): Promise<CrawlResult> {
    const cookies = loadShopeeCoookies();
    if (cookies.length > 0) {
      this.logger.log(`Using ${cookies.length} pre-configured Shopee cookies`);
    } else {
      this.logger.log(
        'No SHOPEE_COOKIES configured. Trying anonymous Shopee access first. ' +
          'If Shopee blocks headless access, set SHOPEE_COOKIES as a fallback.',
      );
    }

    const normalizedTargetCount = Math.max(1, targetCount);

    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
      let browser: Browser | null = null;
      let context: BrowserContext | null = null;
      const startedAt = Date.now();

      try {
        const headless = this.shouldRunHeadless();
        browser = await chromium.launch({
          headless,
          slowMo: headless ? 0 : DEFAULT_BROWSER_SLOW_MO_MS,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
          ],
        });

        this.logger.log(
          `Launching Playwright browser in ${headless ? 'headless' : 'visible'} mode`,
        );

        context = await browser.newContext({
          userAgent: USER_AGENT,
          viewport: { width: 1280, height: 900 },
          locale: 'vi-VN',
          extraHTTPHeaders: {
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        });

        await context.addInitScript(() => {
          Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        });

        if (cookies.length > 0) {
          await context.addCookies(cookies);
        }

        const page = await context.newPage();
        page.setDefaultTimeout(TIMEOUT_MS);
        page.setDefaultNavigationTimeout(TIMEOUT_MS);

        const url = `${SHOPEE_SEARCH_URL}${encodeURIComponent(keyword)}`;
        this.logger.log(`Navigating to: ${url} (attempt ${attempt}/${MAX_RETRIES + 1})`);

        const products = await this.runWithTimeout(
          this.collectProducts(page, url, normalizedTargetCount),
          TIMEOUT_MS,
          `Crawl timeout after ${TIMEOUT_MS}ms for keyword "${keyword}"`,
        );

        this.logger.log(
          `Extracted ${products.length} products from DOM for keyword: "${keyword}" in ${Date.now() - startedAt}ms`,
        );

        if (products.length === 0) {
          const title = await page.title();
          this.logger.warn(`Page title: "${title}"`);
        }

        return { type: 'dom', products };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Crawl attempt ${attempt}/${MAX_RETRIES + 1} failed: ${message}`);

        if (this.isLoginRedirectError(message) || attempt > MAX_RETRIES) {
          throw error;
        }
      } finally {
        await context?.close().catch(() => undefined);
        await browser?.close().catch(() => undefined);
      }
    }

    throw new Error('Crawl failed after max retries');
  }

  private async collectProducts(page: Page, url: string, targetCount: number): Promise<RawProduct[]> {
    await this.prepareShopeeSession(page);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.ensureSearchPageLoaded(page);
    await this.autoScroll(page, targetCount);
    await this.assertNotLoginRedirect(page);

    return page.evaluate(({ selector }): RawProduct[] => {
      const results: RawProduct[] = [];
      const processedUrls = new Set<string>();

      const normalizeUrl = (href: string): string => {
        const fullUrl = href.startsWith('http') ? href : `https://shopee.vn${href}`;
        return fullUrl.split('?')[0];
      };

      const readText = (element: Element, selectors: string[]): string => {
        for (const selector of selectors) {
          const text = element.querySelector(selector)?.textContent?.trim();
          if (text) {
            return text;
          }
        }

        return '';
      };

      const extractFromElement = (element: Element): void => {
        const anchor = element.tagName === 'A'
          ? (element as HTMLAnchorElement)
          : element.querySelector('a');
        if (!anchor) return;

        const href = anchor.getAttribute('href') ?? '';
        if (!href) return;

        const cleanUrl = normalizeUrl(href);
        if (!cleanUrl.includes('/product/') && !cleanUrl.match(/\.\d+\.\d+/)) return;
        if (processedUrls.has(cleanUrl)) return;

        const title = readText(element, [
          '[data-sqe="name"]',
          '.line-clamp-2',
          '.line-clamp-2.h691Eh',
          '.CVRGPi',
          '.RoJ6gN',
          'div[class*="name"]',
          'div[class*="title"]',
        ]);
        if (!title) return;

        const price = readText(element, [
          '[data-sqe="price"]',
          'span[class*="price"]',
          'div[class*="price"]',
        ]);
        const originalPrice = readText(element, [
          'span[class*="original"]',
          'div[class*="original"]',
          'span[class*="strikethrough"]',
        ]);
        const rating = readText(element, [
          'div[class*="rating"]',
          'span[class*="rating"]',
          'div[class*="star"]',
        ]);
        const sold = readText(element, [
          'div[class*="sold"]',
          'span[class*="sold"]',
          'div[class*="sale"]',
        ]);
        const shopName = readText(element, [
          'div[class*="shop"]',
          'span[class*="shop"]',
          'div[class*="seller"]',
        ]);

        const imgEl = element.querySelector('img');
        const imageUrl =
          imgEl?.getAttribute('src') ??
          imgEl?.getAttribute('data-src') ??
          imgEl?.getAttribute('srcset')?.split(' ')[0] ??
          '';

        processedUrls.add(cleanUrl);
        results.push({
          title,
          price,
          originalPrice,
          imageUrl,
          url: cleanUrl,
          rating,
          sold,
          shopName,
        });
      };

      document.querySelectorAll(selector).forEach((card) => {
        try {
          extractFromElement(card);
        } catch {
          // Continue collecting the remaining cards.
        }
      });

      if (results.length === 0) {
        document.querySelectorAll('a[href]').forEach((anchor) => {
          try {
            const href = (anchor as HTMLAnchorElement).getAttribute('href') ?? '';
            if (href.includes('/product/') || href.match(/\.\d+\.\d+/)) {
              extractFromElement(anchor);
            }
          } catch {
            // Continue collecting the remaining anchors.
          }
        });
      }

      return results;
    }, { selector: PRODUCT_CARD_SELECTOR });
  }

  private async ensureSearchPageLoaded(page: Page): Promise<void> {
    await this.assertNotLoginRedirect(page);

    try {
      await page.waitForSelector(PRODUCT_CARD_SELECTOR, { timeout: 20_000 });
    } catch {
      this.logger.warn('No product cards found after initial load; continuing with best-effort extraction');
    }
  }

  private async assertNotLoginRedirect(page: Page): Promise<void> {
    let currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/buyer/login')) {
      const recovered = await this.tryReturnHomeFromLogin(page);
      if (recovered) {
        currentUrl = page.url();
      }
    }

    if (currentUrl.includes('/login') || currentUrl.includes('/buyer/login')) {
      throw new Error(
        'Shopee redirected the automation browser to login during anonymous crawl. ' +
          'This session is blocked from anonymous scraping. Configure SHOPEE_COOKIES in .env as a fallback.',
      );
    }
  }

  private isLoginRedirectError(message: string): boolean {
    const normalized = message.toLowerCase();
    return normalized.includes('redirected') && normalized.includes('login');
  }

  private async prepareShopeeSession(page: Page): Promise<void> {
    await page.goto(SHOPEE_HOME_URL, { waitUntil: 'domcontentloaded' });
    await this.selectVietnameseLanguage(page);
    await this.assertNotLoginRedirect(page);
  }

  private async tryReturnHomeFromLogin(page: Page): Promise<boolean> {
    const currentUrl = page.url();
    if (!currentUrl.includes('/login') && !currentUrl.includes('/buyer/login')) {
      return true;
    }

    this.logger.warn('Shopee login page detected, attempting to click Shopee home link');

    const logoLinkCandidates = [
      page.locator('a[href="/"]').first(),
      page.locator('a.jsl9A1').first(),
      page.getByRole('link', { name: /shopee/i }).first(),
      page.locator('a[href="https://shopee.vn/"]').first(),
      page.locator('a:has(img[alt*="Shopee"]), a:has(svg)').first(),
    ];

    for (const candidate of logoLinkCandidates) {
      try {
        if (!(await candidate.isVisible({ timeout: 2_000 }))) {
          continue;
        }

        await candidate.click();
        await page.waitForLoadState('domcontentloaded').catch(() => undefined);
        await page.waitForTimeout(1_500);
        await this.selectVietnameseLanguage(page);

        const urlAfterClick = page.url();
        if (!urlAfterClick.includes('/login') && !urlAfterClick.includes('/buyer/login')) {
          this.logger.log('Recovered from Shopee login page via home link');
          return true;
        }
      } catch {
        // Try the next possible home link.
      }
    }

    return false;
  }

  private shouldRunHeadless(): boolean {
    const configured = process.env.PLAYWRIGHT_HEADLESS?.trim().toLowerCase();
    if (configured === 'true') return true;
    if (configured === 'false') return false;

    return process.env.NODE_ENV === 'production';
  }

  private async selectVietnameseLanguage(page: Page): Promise<void> {
    const vietnameseButton = page.getByRole('button', { name: /tiếng việt/i }).first();

    try {
      if (!(await vietnameseButton.isVisible({ timeout: 5_000 }))) {
        return;
      }
    } catch {
      return;
    }

    this.logger.log('Shopee language chooser detected, selecting Tiếng Việt');
    await vietnameseButton.click();
    await page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await page.waitForTimeout(1_000);
  }

  private async autoScroll(page: Page, targetCount: number): Promise<void> {
    let previousCount = 0;
    let stableRounds = 0;

    for (let step = 0; step < MAX_SCROLL_STEPS; step++) {
      const currentCount = await page.locator(PRODUCT_CARD_SELECTOR).count();
      if (currentCount >= targetCount) {
        this.logger.log(`Scroll target reached with ${currentCount} items`);
        break;
      }

      if (currentCount > previousCount) {
        previousCount = currentCount;
        stableRounds = 0;
      } else {
        stableRounds += 1;
      }

      if (stableRounds >= MAX_STABLE_SCROLL_ROUNDS) {
        this.logger.log(`Stopping scroll after ${step + 1} steps with ${currentCount} items loaded`);
        break;
      }

      await page.mouse.wheel(0, 1800);
      await page.waitForTimeout(1200);
    }

    await page.waitForTimeout(1000);
  }

  private async runWithTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
    let timeoutHandle: NodeJS.Timeout | undefined;

    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timeoutHandle = setTimeout(() => reject(new Error(message)), timeoutMs);
        }),
      ]);
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    }
  }
}
