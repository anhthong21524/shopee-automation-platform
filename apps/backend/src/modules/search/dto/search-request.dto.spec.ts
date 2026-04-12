import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SearchRequestDto } from './search-request.dto';

async function validateDto(plain: object): Promise<string[]> {
  const dto = plainToInstance(SearchRequestDto, plain);
  const errors = await validate(dto);
  return errors.map((e) => e.property);
}

describe('SearchRequestDto', () => {
  it('passes with a valid keyword', async () => {
    expect(await validateDto({ keyword: 'iphone' })).toHaveLength(0);
  });

  it('fails when keyword is an empty string', async () => {
    expect(await validateDto({ keyword: '' })).toContain('keyword');
  });

  it('fails when keyword is whitespace only', async () => {
    // @Transform trims first, then @IsNotEmpty catches the empty string
    expect(await validateDto({ keyword: '   ' })).toContain('keyword');
  });

  it('fails when keyword is missing', async () => {
    expect(await validateDto({})).toContain('keyword');
  });

  it('defaults limit to 20 when omitted', () => {
    const dto = plainToInstance(SearchRequestDto, { keyword: 'iphone' });
    expect(dto.limit).toBe(20);
  });

  it('passes with a valid explicit limit', async () => {
    expect(await validateDto({ keyword: 'iphone', limit: 10 })).toHaveLength(0);
  });

  it('fails when limit is 0', async () => {
    expect(await validateDto({ keyword: 'iphone', limit: 0 })).toContain('limit');
  });

  it('fails when limit is negative', async () => {
    expect(await validateDto({ keyword: 'iphone', limit: -5 })).toContain('limit');
  });

  it('fails when limit exceeds 50', async () => {
    expect(await validateDto({ keyword: 'iphone', limit: 51 })).toContain('limit');
  });

  it('trims keyword before returning', () => {
    const dto = plainToInstance(SearchRequestDto, { keyword: '  iphone  ' });
    expect(dto.keyword).toBe('iphone');
  });
});
