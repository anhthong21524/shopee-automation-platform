import { ref } from 'vue';
import type { SearchRequest, SearchResponse } from '@shopee-automation/shared';
import { searchProducts } from '@/api/search';

export type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export function useSearch() {
  const status = ref<SearchStatus>('idle');
  const result = ref<SearchResponse | null>(null);
  const errorMessage = ref('');
  const lastRequest = ref<SearchRequest | null>(null);

  async function search(keyword: string, limit: number): Promise<void> {
    if (status.value === 'loading') {
      return;
    }

    const request: SearchRequest = {
      keyword: keyword.trim(),
      limit,
    };

    lastRequest.value = request;
    status.value = 'loading';
    errorMessage.value = '';
    result.value = null;

    try {
      const response = await searchProducts(request);
      result.value = response;
      status.value = response.products.length > 0 ? 'success' : 'empty';
    } catch (err: unknown) {
      status.value = 'error';
      errorMessage.value = extractMessage(err);
    }
  }

  async function retry(): Promise<void> {
    if (!lastRequest.value) {
      return;
    }

    await search(lastRequest.value.keyword, lastRequest.value.limit ?? 20);
  }

  return { status, result, errorMessage, search, retry };
}

function extractMessage(err: unknown): string {
  if (
    err !== null &&
    typeof err === 'object' &&
    'response' in err &&
    err.response !== null &&
    typeof err.response === 'object' &&
    'data' in err.response
  ) {
    const { data } = err.response as { data: unknown };
    if (typeof data === 'object' && data !== null && 'message' in data) {
      return String((data as { message: unknown }).message);
    }
  }

  return 'We could not complete the search. Please try again.';
}
