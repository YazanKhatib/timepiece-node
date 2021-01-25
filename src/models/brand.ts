import { Model } from 'objection';
import { Watch } from 'models';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class Brand extends Model {
  @Field() readonly id!: number;
  @Field() name!: string;
  @Field() created_at?: Date;
  @Field() updated_at?: Date;

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
