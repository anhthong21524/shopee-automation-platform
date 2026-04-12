import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WorkflowOrchestrator } from './workflow.orchestrator';
import { WorkflowRequestDto } from './dto/workflow-request.dto';
import { WorkflowOutput } from '@shopee-automation/shared';

@ApiTags('Workflow')
@Controller('workflows')
export class WorkflowController {
  constructor(private readonly orchestrator: WorkflowOrchestrator) {}

  @Post('run')
  @ApiOperation({
    summary: 'Run the full automation pipeline',
    description: 'Crawl → evaluate top 3 → generate Facebook post + banner metadata',
  })
  @ApiResponse({ status: 201, description: 'Pipeline completed successfully' })
  @ApiResponse({ status: 400, description: 'Validation error — keyword is blank or limit/tone is invalid' })
  run(@Body() dto: WorkflowRequestDto): Promise<WorkflowOutput> {
    return this.orchestrator.runWorkflow(dto);
  }
}
