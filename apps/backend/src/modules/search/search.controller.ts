import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchRequestDto } from './dto/search-request.dto';
import { SearchResponse } from '@shopee-automation/shared';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  @ApiOperation({ summary: 'Search Shopee products by keyword' })
  @ApiResponse({ status: 201, description: 'Products returned successfully' })
  @ApiResponse({ status: 400, description: 'Validation error — keyword is blank or limit is out of range' })
  search(@Body() dto: SearchRequestDto): Promise<SearchResponse> {
    return this.searchService.searchProducts(dto.keyword, dto.limit ?? 20);
  }
}
