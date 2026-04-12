import axios from 'axios';
import type { SearchRequest, SearchResponse } from '@shopee-automation/shared';

export async function searchProducts(request: SearchRequest): Promise<SearchResponse> {
  const { data } = await axios.post<SearchResponse>('/api/search', request);
  return data;
}
