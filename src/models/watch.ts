import { Model } from 'objection';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class Watch extends Model {
  @Field()
  readonly id!: number;

  @Field()
  brand!: string;

  @Field()
  model: string;

  @Field()
  condition: string;

  @Field()
  delivery: string;

  @Field()
  location: string;

  @Field()
  featured: boolean;

  @Field()
  favorite: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  static get tableName() {
    return 'watches';
  }
}
