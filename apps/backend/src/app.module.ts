import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchModule } from './modules/search/search.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { ProductModule } from './modules/product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/shopee-automation'),
    ProductModule,
    SearchModule,
    WorkflowModule,
  ],
})
export class AppModule {}
