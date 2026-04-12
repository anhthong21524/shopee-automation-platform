import { ScoredProduct } from './product.types';

export type PostTone = 'ban-hang' | 'review' | 'tu-mo';

export interface FacebookPostDraft {
  tone: PostTone;
  content: string;
  productLinks: string[];
  createdAt: string;
}

export interface BannerResult {
  productTitle: string;
  productImageUrl: string;
  price: number;
  discountPercent?: number;
  ctaText: string;
  shopeeUrl: string;
  generatedAt: string;
}

export interface WorkflowOutput {
  keyword: string;
  top3: ScoredProduct[];
  post: FacebookPostDraft;
  banner: BannerResult | null;
  completedAt: string;
}
