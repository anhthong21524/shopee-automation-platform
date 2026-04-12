import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchRequestDto } from './dto/search-request.dto';
import type { SearchResponse } from '@shopee-automation/shared';

const mockResponse: SearchResponse = {
  keyword: 'iphone',
  total: 2,
  products: [],
};

describe('SearchController', () => {
  let controller: SearchController;
  let service: jest.Mocked<Pick<SearchService, 'searchProducts'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: { searchProducts: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    service = module.get(SearchService);
    jest.clearAllMocks();
  });

  it('calls searchProducts with keyword and provided limit', async () => {
    (service.searchProducts as jest.Mock).mockResolvedValue(mockResponse);

    const dto = Object.assign(new SearchRequestDto(), { keyword: 'iphone', limit: 10 });
    const result = await controller.search(dto);

    expect(service.searchProducts).toHaveBeenCalledWith('iphone', 10);
    expect(result).toEqual(mockResponse);
  });

  it('defaults limit to 20 when not provided', async () => {
    (service.searchProducts as jest.Mock).mockResolvedValue({
      keyword: 'test',
      total: 0,
      products: [],
    });

    // limit is undefined — controller uses ?? 20
    const dto = Object.assign(new SearchRequestDto(), { keyword: 'test', limit: undefined });
    await controller.search(dto);

    expect(service.searchProducts).toHaveBeenCalledWith('test', 20);
  });
});
