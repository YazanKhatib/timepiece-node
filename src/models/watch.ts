import { Model } from 'objection';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class Watch extends Model {
  @Field()
  readonly id!: number;

  @Field()
  brand: string;

  @Field()
  model: string;

  @Field()
  min: number;

  @Field()
  max: number;
  createdAt?: Date;
  updatedAt?: Date;

  static get tableName() {
    return 'watches';
  }
}
