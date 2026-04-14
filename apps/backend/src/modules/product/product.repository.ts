import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { ProductCandidate } from '@shopee-automation/shared';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async upsertMany(candidates: ProductCandidate[]): Promise<void> {
    if (candidates.length === 0) {
      return;
    }

    const ops = candidates.map((c) => ({
      updateOne: {
        filter: { url: c.url },
        update: { $set: c },
        upsert: true,
      },
    }));
    await this.productModel.bulkWrite(ops);
  }

  async findByKeyword(keyword: string): Promise<Product[]> {
    return this.productModel.find({ keyword }).lean().exec();
  }

  async saveWorkflowResult(data: Record<string, unknown>): Promise<void> {
    // Stored via a separate WorkflowResult schema in future — placeholder
    void data;
  }
}
