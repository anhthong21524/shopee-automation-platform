import { ProductCandidate } from '../types/product.types';

export interface SearchRequest {
  keyword: string;
  limit?: number;
}

export interface SearchResponse {
  keyword: string;
  total: number;
  products: ProductCandidate[];
}
