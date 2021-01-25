import { Model } from 'objection';
import { Watch, Certificate } from 'models';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class User extends Model {
  @Field()
  readonly id!: number;

  token: string;
  count: number;
  password: string;
  @Field() username!: string;
  @Field() email: string;
  @Field() blocked: boolean;
  @Field() confirmed: boolean;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) birth: Date;
  @Field({ nullable: true }) gender: string;
  @Field({ nullable: true }) address: string;
  @Field({ nullable: true }) first_name: string;
  @Field({ nullable: true }) last_name: string;
  @Field({ defaultValue: 'user' }) role: 'user' | 'dealer' | 'admin';

  @Field() created_at?: Date;
  @Field() updated_at?: Date;

  static get tableName() {
    return 'users';
  }

  static relationMappings = () => ({
    favorites: {
      relation: Model.ManyToManyRelation,
      modelClass: Watch,
      join: {
        from: 'users.id',
        through: {
          from: 'users_watches.user_id',
          to: 'users_watches.watch_id',
        },
        to: 'watches.id',
      },
    },
    offers: {
      relation: Model.ManyToManyRelation,
      modelClass: Watch,
      join: {
        from: 'users.id',
        through: {
          from: 'offers.user_id',
          to: 'offers.watch_id',
          extra: ['proposed_price', 'approved'],
        },
        to: 'watches.id',
      },
    },
    orders: {
      relation: Model.HasManyRelation,
      modelClass: Watch,
      join: {
        from: 'users.id',
        to: 'watches.order_id',
      },
    },
    watches: {
      relation: Model.HasManyRelation,
      modelClass: Watch,
      join: {
        from: 'users.id',
        to: 'watches.owner_id',
      },
    },
    requests: {
      relation: Model.HasManyRelation,
      modelClass: Certificate,
      join: {
        from: 'users.id',
        to: 'certificates.user_id',
      },
    },
  });
}
