import { Model } from 'objection';
import { User } from 'models';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class Certificate extends Model {
  @Field() readonly id!: number;
  @Field() user_id!: number;
  @Field() fulfilled!: boolean;
  @Field() createdAt?: Date;
  @Field() updatedAt?: Date;

  static get tableName() {
    return 'certificates';
  }

  static relationMappings = () => ({
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'certificates.user_id',
        to: 'users.id',
      },
    },
  });
}
