import { IsNotEmpty, IsString, IsInt, IsOptional, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PostTone } from '@shopee-automation/shared';

export class WorkflowRequestDto {
  @ApiProperty({ example: 'iPhone 15', description: 'Search keyword' })
  @IsString()
  @IsNotEmpty()
  keyword: string;

  @ApiProperty({
    example: 20,
    description: 'Maximum number of products to crawl (1–50)',
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

  @ApiProperty({
    example: 'ban-hang',
    description: 'Tone for the generated Facebook post',
    required: false,
    default: 'ban-hang',
    enum: ['ban-hang', 'review', 'tu-mo'],
  })
  @IsOptional()
  @IsIn(['ban-hang', 'review', 'tu-mo'] satisfies PostTone[])
  tone?: PostTone = 'ban-hang';
}
