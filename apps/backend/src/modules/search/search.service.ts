import { Injectable } from '@nestjs/common';
import { CrawlerService } from '../crawler/crawler.service';
import { ParserService } from '../parser/parser.service';
import { ProductRepository } from '../product/product.repository';
import { ProductCandidate, SearchResponse } from '@shopee-automation/shared';

@Injectable()
export class SearchService {
  constructor(
    private readonly crawler: CrawlerService,
    private readonly parser: ParserService,
    private readonly productRepo: ProductRepository,
  ) {}

  async searchProducts(keyword: string, limit: number): Promise<SearchResponse> {
    const crawlResult = await this.crawler.crawlSearchPage(keyword, limit);
    const candidates: ProductCandidate[] = this.parser.parseProducts(crawlResult, keyword);
    const limited = candidates.slice(0, limit);

    if (limited.length > 0) {
      await this.productRepo.upsertMany(limited);
    }

    return { keyword, total: limited.length, products: limited };
  }
}
