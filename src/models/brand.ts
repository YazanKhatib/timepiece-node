import { Model } from 'objection';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class Brand extends Model {
  @Field() readonly id!: number;
  @Field() name!: string;
  @Field() createdAt?: Date;
  @Field() updatedAt?: Date;

  static get tableName() {
    return 'brands';
  }
}
