import { Injectable, Logger } from '@nestjs/common';
import { ProductCandidate } from '@shopee-automation/shared';
import { CrawlResult, RawProduct } from '../crawler/crawler.service';

@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);

  parseProducts(crawlResult: CrawlResult, keyword: string): ProductCandidate[] {
    const candidates = this.parseDomProducts(crawlResult.products, keyword);

    if (candidates.length === 0) {
      this.logger.warn(`No products parsed for keyword: "${keyword}"`);
    } else {
      this.logger.log(`Parsed ${candidates.length} products for keyword: "${keyword}"`);
    }

    return candidates;
  }

  private parseDomProducts(rawProducts: RawProduct[], keyword: string): ProductCandidate[] {
    const candidates: ProductCandidate[] = [];

    for (const raw of rawProducts) {
      const title = raw.title.trim();
      if (!title) continue;

      const price = this.parsePrice(raw.price);
      const originalPrice = raw.originalPrice ? this.parsePrice(raw.originalPrice) : undefined;
      const rating = this.parseRating(raw.rating);
      const soldCount = this.parseSold(raw.sold);

      candidates.push({
        keyword,
        title,
        url: raw.url,
        imageUrl: raw.imageUrl,
        price,
        originalPrice,
        rating,
        soldCount,
        shopName: raw.shopName || undefined,
      });
    }

    return candidates;
  }

  /** Parse price string like "₱1.234" or "1.234.567" → number */
  private parsePrice(raw: string): number {
    const cleaned = raw.replace(/[₱\s,]/g, '').replace(/\./g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  /** Parse rating string like "4.8" → number */
  private parseRating(raw: string): number | undefined {
    const match = raw.match(/(\d+(?:\.\d+)?)/);
    if (!match) return undefined;
    const rating = parseFloat(match[1]);
    return rating > 0 && rating <= 5 ? rating : undefined;
  }

  /** Parse sold count like "5.3k sold" or "1.2k đã bán" → number */
  private parseSold(raw: string): number | undefined {
    const lower = raw.toLowerCase();
    const kMatch = lower.match(/(\d+(?:\.\d+)?)\s*k/);
    if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);
    const numMatch = raw.match(/(\d+(?:[.,]\d+)*)/);
    if (!numMatch) return undefined;
    const num = parseInt(numMatch[1].replace(/[.,]/g, ''), 10);
    return isNaN(num) ? undefined : num;
  }
}
