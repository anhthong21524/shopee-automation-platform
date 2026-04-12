import { Injectable } from '@nestjs/common';
import { ScoredProduct, FacebookPostDraft, PostTone } from '@shopee-automation/shared';

const TONE_TEMPLATES: Record<PostTone, (products: ScoredProduct[]) => string> = {
  'ban-hang': (products) =>
    `🔥 HOT DEAL HÔM NAY!\n\nTop ${products.length} sản phẩm giá tốt nhất:\n` +
    products.map((p, i) => `${i + 1}. ${p.title} - ${p.price.toLocaleString()}đ 👉 ${p.url}`).join('\n') +
    `\n\n#muasắm #shopee #dealhot`,

  'review': (products) =>
    `📝 REVIEW TOP SẢN PHẨM ĐÁNG MUA:\n\n` +
    products.map((p, i) => `${i + 1}. ${p.title}\n   ⭐ ${p.rating ?? 'N/A'} | Đã bán: ${p.soldCount ?? '?'}\n   🔗 ${p.url}`).join('\n\n') +
    `\n\n#review #shopee`,

  'tu-mo': (products) =>
    `Mình vừa tìm được ${products.length} món hot trên Shopee, chia sẻ cho ai cần nè!\n\n` +
    products.map((p, i) => `${i + 1}. ${p.title}\n💰 Giá: ${p.price.toLocaleString()}đ\n🛒 ${p.url}`).join('\n\n'),
};

@Injectable()
export class FacebookPostGeneratorService {
  generatePost(top3: ScoredProduct[], tone: PostTone = 'ban-hang'): FacebookPostDraft {
    const template = TONE_TEMPLATES[tone] ?? TONE_TEMPLATES['ban-hang'];
    const content = template(top3);

    return {
      tone,
      content,
      productLinks: top3.map((p) => p.url),
      createdAt: new Date().toISOString(),
    };
  }
}
