import { ref } from 'vue';
import type { SearchRequest, SearchResponse } from '@shopee-automation/shared';

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
      const response = await createMockSearchResponse(request);
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

async function createMockSearchResponse(request: SearchRequest): Promise<SearchResponse> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const keyword = request.keyword.trim() || 'Aukey';

  return {
    keyword,
    total: 3,
    products: [
      {
        keyword,
        title: 'Premium Smartphone - Latest Model with Advanced Camera System',
        url: 'https://shopee.vn',
        imageUrl:
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
        price: 3114.18,
        rating: 4.6,
        soldCount: 5900,
        shopName: 'TechHub Official Store',
      },
      {
        keyword,
        title: 'Wireless Earbuds Pro - Active Noise Cancellation Technology',
        url: 'https://shopee.vn',
        imageUrl:
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80',
        price: 5962.38,
        rating: 5,
        soldCount: 1400,
        shopName: 'GadgetStore Official Store',
      },
      {
        keyword,
        title: 'Smart Watch Series 8 - Fitness & Health Tracking Device',
        url: 'https://shopee.vn',
        imageUrl:
          'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80',
        price: 8291.64,
        rating: 4.6,
        soldCount: 2600,
        shopName: 'ElectroShop Official Store',
      },
    ],
  };
}
