import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { CrawlerModule } from '../crawler/crawler.module';
import { ParserModule } from '../parser/parser.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [CrawlerModule, ParserModule, ProductModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
