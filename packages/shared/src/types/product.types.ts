export interface ProductCandidate {
  keyword: string;
  title: string;
  url: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating?: number;
  soldCount?: number;
  shopName?: string;
}

export interface ScoreBreakdown {
  price: number;
  rating: number;
  sold: number;
  shop: number;
}

export interface ScoredProduct extends ProductCandidate {
  totalScore: number;
  scoreBreakdown: ScoreBreakdown;
}

export interface EvaluationResult {
  top: ScoredProduct[];
  all: ScoredProduct[];
}
