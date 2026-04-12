import { IsNotEmpty, IsString, IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchRequestDto {
  @ApiProperty({ example: 'iPhone 15', description: 'Search keyword' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  keyword: string;

  @ApiProperty({
    example: 20,
    description: 'Maximum number of results to return (1–50)',
    required: false,
    default: 20,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
