import { Module } from '@nestjs/common';
import { ProductEvaluationService } from './evaluation.service';

@Module({
  providers: [ProductEvaluationService],
  exports: [ProductEvaluationService],
})
export class EvaluationModule {}
