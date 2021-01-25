import { Model } from 'objection';
import { Watch } from 'models';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class Image extends Model {
  @Field() readonly id!: number;
  @Field() url!: string;
  @Field() main: boolean;
  @Field() created_at?: Date;
  @Field() updated_at?: Date;

  static get tableName() {
    return 'images';
  }
  static relationMappings = () => ({
    watch: {
      relation: Model.BelongsToOneRelation,
      modelClass: Watch,
      join: {
        from: 'images.watch_id',
        to: 'watches.id',
      },
    },
  });
}
