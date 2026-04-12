import { Module } from '@nestjs/common';
import { WorkflowController } from './workflow.controller';
import { WorkflowOrchestrator } from './workflow.orchestrator';
import { SearchModule } from '../search/search.module';
import { EvaluationModule } from '../evaluation/evaluation.module';
import { ContentModule } from '../content/content.module';
import { AssetModule } from '../asset/asset.module';

@Module({
  imports: [SearchModule, EvaluationModule, ContentModule, AssetModule],
  controllers: [WorkflowController],
  providers: [WorkflowOrchestrator],
})
export class WorkflowModule {}
