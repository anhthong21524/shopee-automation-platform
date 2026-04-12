import { Injectable } from '@nestjs/common';
import { SearchService } from '../search/search.service';
import { ProductEvaluationService } from '../evaluation/evaluation.service';
import { FacebookPostGeneratorService } from '../content/content.service';
import { ImageAssetService } from '../asset/asset.service';
import { WorkflowRequest, WorkflowOutput } from '@shopee-automation/shared';

@Injectable()
export class WorkflowOrchestrator {
  constructor(
    private readonly search: SearchService,
    private readonly evaluation: ProductEvaluationService,
    private readonly content: FacebookPostGeneratorService,
    private readonly asset: ImageAssetService,
  ) {}

  async runWorkflow(request: WorkflowRequest): Promise<WorkflowOutput> {
    // Search Phase
    const searchResult = await this.search.searchProducts(request.keyword, request.limit ?? 20);

    // Evaluation Phase
    const evalResult = this.evaluation.evaluateProducts(searchResult.products);

    // Content Generation Phase
    const postDraft = this.content.generatePost(evalResult.top, request.tone ?? 'ban-hang');

    // Image Generation Phase
    const banner = evalResult.top[0]
      ? this.asset.generateBanner(evalResult.top[0])
      : null;

    return {
      keyword: request.keyword,
      top3: evalResult.top,
      post: postDraft,
      banner,
      completedAt: new Date().toISOString(),
    };
  }
}
