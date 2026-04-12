import { Injectable, Logger } from '@nestjs/common';
import { ScoredProduct, BannerResult } from '@shopee-automation/shared';

@Injectable()
export class ImageAssetService {
  private readonly logger = new Logger(ImageAssetService.name);

  generateBanner(bestProduct: ScoredProduct): BannerResult {
    // MVP: Return metadata for client-side rendering.
    // Future: use canvas/sharp to generate actual image file.
    this.logger.log(`Generating banner for: ${bestProduct.title}`);

    return {
      productTitle: bestProduct.title,
      productImageUrl: bestProduct.imageUrl,
      price: bestProduct.price,
      discountPercent: bestProduct.discountPercent,
      ctaText: 'Mua ngay trên Shopee!',
      shopeeUrl: bestProduct.url,
      generatedAt: new Date().toISOString(),
    };
  }
}
