import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  keyword: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  url: string;

  @Prop()
  imageUrl: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  originalPrice?: number;

  @Prop()
  discountPercent?: number;

  @Prop()
  rating?: number;

  @Prop()
  soldCount?: number;

  @Prop()
  shopName?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ keyword: 1 });
ProductSchema.index({ url: 1 }, { unique: true });
