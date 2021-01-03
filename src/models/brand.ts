import { Model } from 'objection';
import { Watch } from 'models';
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

  static relationMappings = () => ({
    products: {
      relation: Model.HasManyRelation,
      modelClass: Watch,
      join: {
        from: 'brands.id',
        to: 'watches.brand_id',
      },
    },
  });
}
