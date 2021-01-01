import { Model } from 'objection';
import { Watch } from 'models';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class User extends Model {
  @Field()
  readonly id!: number;

  @Field() username!: string;
  @Field() password: string;
  @Field() email: string;
  @Field() count: number;
  @Field() dealer: boolean;
  @Field() blocked: boolean;
  @Field() confirmed: boolean;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) birth: Date;
  @Field({ nullable: true }) gender: string;
  @Field({ defaultValue: false }) isAdmin: boolean;
  @Field({ nullable: true }) address: string;
  @Field({ nullable: true }) first_name: string;
  @Field({ nullable: true }) last_name: string;
  @Field({ nullable: true }) token: string;
  @Field((type) => [Watch]) offers: Watch[];

  createdAt?: Date;
  updatedAt?: Date;

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
          extra: ['proposed_price'],
        },
        to: 'watches.id',
      },
    },
  });
}
