import { Module } from '@nestjs/common';
import { ImageAssetService } from './asset.service';

@Module({
  providers: [ImageAssetService],
  exports: [ImageAssetService],
})
export class AssetModule {}
