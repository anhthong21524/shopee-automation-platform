import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser, BrowserContext, Cookie } from 'playwright';

const SHOPEE_SEARCH_URL = 'https://shopee.vn/search?keyword=';
const MAX_RETRIES = 2;
const TIMEOUT_MS = 60_000;

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

  async crawlSearchPage(keyword: string): Promise<CrawlResult> {
    const cookies = loadShopeeCoookies();
    if (cookies.length > 0) {
      this.logger.log(`Using ${cookies.length} pre-configured Shopee cookies`);
    } else {
      this.logger.warn(
        'No SHOPEE_COOKIES configured. Shopee.vn may redirect to the login page. ' +
          'Set SHOPEE_COOKIES in .env (see .env.example).',
      );
    }

    let attempt = 0;
    while (attempt <= MAX_RETRIES) {
      let browser: Browser | null = null;
      try {
        browser = await chromium.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
          ],
        });

        const context: BrowserContext = await browser.newContext({
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

        // Inject session cookies if provided
        if (cookies.length > 0) {
          await context.addCookies(cookies);
        }

        const page = await context.newPage();
        page.setDefaultTimeout(TIMEOUT_MS);

        const url = `${SHOPEE_SEARCH_URL}${encodeURIComponent(keyword)}`;
        this.logger.log(`Navigating to: ${url} (attempt ${attempt + 1})`);

        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Detect login redirect
        const currentUrl = page.url();
        if (currentUrl.includes('/login') || currentUrl.includes('/buyer/login')) {
          throw new Error(
            'Shopee redirected to login. Configure SHOPEE_COOKIES in .env. ' +
              'See .env.example for instructions.',
          );
        }

        // Wait for product cards to appear in the DOM
        try {
          await page.waitForSelector('.shopee-search-item-result__item', { timeout: 20_000 });
        } catch {
          this.logger.warn('Primary selector not found, trying alternate selectors...');
          try {
            await page.waitForSelector('[data-sqe="item"]', { timeout: 10_000 });
          } catch {
            this.logger.warn('No product cards detected in DOM');
          }
        }

        // Scroll to trigger lazy-loaded images
        await this.autoScroll(page);

        // Extract product data from the rendered DOM
        const products = await page.evaluate((): RawProduct[] => {
          const results: RawProduct[] = [];
          const processedUrls = new Set<string>();

          const extractFromElement = (el: Element): void => {
            const anchor = el.tagName === 'A' ? (el as HTMLAnchorElement) : el.querySelector('a');
            if (!anchor) return;

            const href = anchor.getAttribute('href') ?? '';
            const fullUrl = href.startsWith('http') ? href : `https://shopee.vn${href}`;
            const cleanUrl = fullUrl.split('?')[0];
            if (!cleanUrl.includes('.') && !cleanUrl.includes('/product/')) return;
            if (processedUrls.has(cleanUrl)) return;
            processedUrls.add(cleanUrl);

            const imgEl = el.querySelector('img');
            const imageUrl = imgEl?.getAttribute('src') ?? imgEl?.getAttribute('data-src') ?? '';

            const titleEl =
              el.querySelector('[data-sqe="name"]') ??
              el.querySelector('.PoC0rI') ??
              el.querySelector('div[class*="name"]') ??
              el.querySelector('div[class*="title"]');
            const title = titleEl?.textContent?.trim() ?? '';
            if (!title) return;

            const priceEl =
              el.querySelector('[class*="price"]') ?? el.querySelector('[data-sqe="price"]');
            const price = priceEl?.textContent?.trim() ?? '';

            const ratingEl =
              el.querySelector('[class*="rating"]') ?? el.querySelector('[class*="star"]');
            const rating = ratingEl?.textContent?.trim() ?? '';

            const soldEl = el.querySelector('[class*="sold"]');
            const sold = soldEl?.textContent?.trim() ?? '';

            const shopEl =
              el.querySelector('[class*="shop-name"]') ??
              el.querySelector('[class*="seller"]') ??
              el.querySelector('[class*="shopName"]');
            const shopName = shopEl?.textContent?.trim() ?? '';

            results.push({ title, price, originalPrice: '', imageUrl, url: cleanUrl, rating, sold, shopName });
          };

          // Strategy 1: Shopee-specific item wrappers
          const cards = document.querySelectorAll(
            '.shopee-search-item-result__item, [data-sqe="item"]',
          );
          cards.forEach((card) => { try { extractFromElement(card); } catch {} });

          // Strategy 2: product link anchors
          if (results.length === 0) {
            document.querySelectorAll('a[href]').forEach((anchor) => {
              try {
                const href = (anchor as HTMLAnchorElement).href ?? '';
                if (href.match(/\.\d+\.\d+/) || href.includes('/product/')) {
                  extractFromElement(anchor);
                }
              } catch {}
            });
          }

          return results;
        });

        this.logger.log(`Extracted ${products.length} products from DOM for keyword: "${keyword}"`);

        if (products.length === 0) {
          const title = await page.title();
          this.logger.warn(`Page title: "${title}"`);
        }

        return { type: 'dom', products };
      } catch (err) {
        attempt++;
        const msg = (err as Error).message;
        this.logger.warn(`Crawl attempt ${attempt} failed: ${msg}`);
        // Don't retry on login redirect — it will keep failing
        if (msg.includes('redirected to login') || attempt > MAX_RETRIES) throw err;
      } finally {
        await browser?.close();
      }
    }
    throw new Error('Crawl failed after max retries');
  }

  private async autoScroll(page: import('playwright').Page): Promise<void> {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 400;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 200);
      });
    });
    await page.waitForTimeout(1500);
  }
}
