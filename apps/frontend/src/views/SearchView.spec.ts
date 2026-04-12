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

    const limitInput = wrapper.find('input[type="number"]').element as HTMLInputElement;
    expect(limitInput.value).toBe('6');
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

    expect(wrapper.text()).toContain('3 products found');
    expect(wrapper.text()).toContain('Wireless Earbuds Pro');
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
