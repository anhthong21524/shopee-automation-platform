import { Module } from '@nestjs/common';
import { FacebookPostGeneratorService } from './content.service';

@Module({
  providers: [FacebookPostGeneratorService],
  exports: [FacebookPostGeneratorService],
})
export class ContentModule {}
