import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import SearchView from './SearchView.vue';

describe('SearchView', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('shows a validation error when keyword is empty', async () => {
    const wrapper = mount(SearchView);

    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Keyword is required');
  });

  it('defaults limit to 6', () => {
    const wrapper = mount(SearchView);

    const limitInput = wrapper.find('#limit').element as HTMLInputElement;
    expect(limitInput.value).toBe('6');
  });

  it('keeps advanced filters collapsed by default and toggles open on click', async () => {
    const wrapper = mount(SearchView);

    expect(wrapper.find('#min-price').exists()).toBe(false);

    await wrapper.get('[data-testid="advanced-filters"] button').trigger('click');

    expect(wrapper.find('#min-price').exists()).toBe(true);
    expect(wrapper.get('[data-testid="advanced-filters"] button').attributes('aria-expanded')).toBe(
      'true',
    );
  });

  it('shows inline advanced filter validation and resets only advanced filter values', async () => {
    const wrapper = mount(SearchView);

    await wrapper.get('[data-testid="advanced-filters"] button').trigger('click');
    await wrapper.get('#min-price').setValue('500');
    await wrapper.get('#max-price').setValue('100');
    await wrapper.get('#minimum-rating').setValue('7');
    await wrapper.get('#minimum-sold-count').setValue('-1');
    await wrapper.get('#minimum-review-count').setValue('20');
    await wrapper.get('#max-one-star-reviews').setValue('4');
    await wrapper.get('#sort-by').setValue('highest-rating');
    await wrapper.get('button.primary-button').trigger('click');

    expect(wrapper.text()).toContain('Max price must be greater than or equal to min price.');
    expect(wrapper.text()).toContain('Minimum rating must be between 0 and 5.');
    expect(wrapper.text()).toContain('Minimum sold count must be at least 0.');

    await wrapper.get('button.secondary-button').trigger('click');

    expect((wrapper.get('#min-price').element as HTMLInputElement).value).toBe('');
    expect((wrapper.get('#max-price').element as HTMLInputElement).value).toBe('');
    expect((wrapper.get('#minimum-rating').element as HTMLInputElement).value).toBe('');
    expect((wrapper.get('#minimum-sold-count').element as HTMLInputElement).value).toBe('');
    expect((wrapper.get('#minimum-review-count').element as HTMLInputElement).value).toBe('');
    expect((wrapper.get('#max-one-star-reviews').element as HTMLInputElement).value).toBe('');
    expect((wrapper.get('#sort-by').element as HTMLSelectElement).value).toBe('default');
  });

  it('formats price inputs with thousands separators', async () => {
    const wrapper = mount(SearchView);

    await wrapper.get('[data-testid="advanced-filters"] button').trigger('click');
    await wrapper.get('#min-price').setValue('50000');
    await wrapper.get('#max-price').setValue('100000');

    expect((wrapper.get('#min-price').element as HTMLInputElement).value).toBe('50,000');
    expect((wrapper.get('#max-price').element as HTMLInputElement).value).toBe('100,000');
  });

  it('shows mocked results with the trimmed keyword on submit', async () => {
    const wrapper = mount(SearchView);
    await wrapper.find('#keyword').setValue('  iphone  ');
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await new Promise((resolve) => setTimeout(resolve, 650));
    await flushPromises();

    expect(wrapper.text()).toContain('Results for "iphone"');
    expect(wrapper.text()).toContain('Premium Smartphone');
  });

  it('disables the form and shows a loading indicator while loading', async () => {
    vi.useFakeTimers();

    const wrapper = mount(SearchView);
    await wrapper.find('#keyword').setValue('iphone');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    expect(wrapper.find('#keyword').attributes('disabled')).toBeDefined();
    expect(wrapper.find('#limit').attributes('disabled')).toBeDefined();
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true);
  });

  it('displays the mocked result cards on success', async () => {
    const wrapper = mount(SearchView);
    await wrapper.find('#keyword').setValue('Aukey');
    await wrapper.find('form').trigger('submit');
    await new Promise((resolve) => setTimeout(resolve, 650));
    await flushPromises();

    expect(wrapper.text()).toContain('4 products found');
    expect(wrapper.text()).toContain('Wireless Earbuds Pro');
    expect(wrapper.text()).toContain('Portable Bluetooth Speaker');
    expect(wrapper.text()).toContain('View on Shopee');
  });

  it('clamps the limit input to 100', async () => {
    const wrapper = mount(SearchView);
    await wrapper.find('#keyword').setValue('iphone');
    await wrapper.find('#limit').setValue('120');
    await wrapper.find('form').trigger('submit');
    await new Promise((resolve) => setTimeout(resolve, 650));
    await flushPromises();

    expect(wrapper.find('#limit').element).toHaveProperty('value', '100');
  });

  it('shows loading before the mocked results resolve', async () => {
    vi.useFakeTimers();

    const wrapper = mount(SearchView);
    await wrapper.find('#keyword').setValue('Aukey');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Searching products');

    await vi.advanceTimersByTimeAsync(650);
    await flushPromises();

    expect(wrapper.text()).toContain('Results for "Aukey"');
  });
});
