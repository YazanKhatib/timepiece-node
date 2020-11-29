import { Model } from 'objection';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class User extends Model {
  @Field()
  readonly id!: number;

  @Field()
  username!: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  email: string;

  @Field()
  count: number;

  @Field()
  dealer: boolean;

  @Field({ nullable: true })
  address: string;

  @Field({ nullable: true })
  first_name: string;

  @Field({ nullable: true })
  last_name: string;

  @Field({ nullable: true })
  token: string;

  @Field()
  confirmed: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  static get tableName() {
    return 'users';
  }
}
