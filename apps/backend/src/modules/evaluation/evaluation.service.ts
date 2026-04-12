import { Injectable } from '@nestjs/common';
import { ProductCandidate, ScoredProduct, EvaluationResult } from '@shopee-automation/shared';

const WEIGHTS = { price: 0.3, rating: 0.3, sold: 0.25, shop: 0.15 };
const TOP_N = 3;

@Injectable()
export class ProductEvaluationService {
  evaluateProducts(products: ProductCandidate[]): EvaluationResult {
    const scored = products.map((p) => this.score(p));
    scored.sort((a, b) => b.totalScore - a.totalScore);
    const top = scored.slice(0, TOP_N);
    return { top, all: scored };
  }

  private score(product: ProductCandidate): ScoredProduct {
    const priceScore = product.discountPercent
      ? Math.min(product.discountPercent, 100)
      : 50;

    const ratingScore = product.rating ? (product.rating / 5) * 100 : 50;

    const soldScore = product.soldCount
      ? Math.min((product.soldCount / 1000) * 100, 100)
      : 0;

    const shopScore = product.shopName ? 60 : 30;

    const totalScore =
      priceScore * WEIGHTS.price +
      ratingScore * WEIGHTS.rating +
      soldScore * WEIGHTS.sold +
      shopScore * WEIGHTS.shop;

    return {
      ...product,
      totalScore: Math.round(totalScore * 10) / 10,
      scoreBreakdown: {
        price: Math.round(priceScore * 10) / 10,
        rating: Math.round(ratingScore * 10) / 10,
        sold: Math.round(soldScore * 10) / 10,
        shop: Math.round(shopScore * 10) / 10,
      },
    };
  }
}
