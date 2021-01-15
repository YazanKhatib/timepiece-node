import { Model } from 'objection';
import { User } from 'models';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class Certificate extends Model {
  @Field() readonly id!: number;
  @Field() fulfilled!: boolean;
  @Field() created_at?: Date;
  @Field() updated_at?: Date;

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
