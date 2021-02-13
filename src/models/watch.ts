import { Model } from 'objection';
import { User, Brand, Image } from 'models';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class Watch extends Model {
  @Field()
  readonly id!: number;

  // Basic info
  @Field() name: string;
  @Field() model: string;
  @Field() price: number;
  @Field() delivery: string;
  @Field() location: string;
  @Field() featured: boolean;
  @Field() condition: string;
  @Field() confirmed: boolean;
  @Field() certified: boolean;
  @Field() description: string;
  @Field() proposed_price: number;
  @Field() production_year: number;
  @Field() status: 'sale' | 'pending' | 'sold';
  @Field({ nullable: true }) case_material: string;
  @Field({ nullable: true }) movement: string;
  @Field({ nullable: true }) bracelet_material: string;
  @Field({ nullable: true }) gender: string;
  @Field({ nullable: true }) brand_id: number;
  @Field(() => [Image]) images: Image[];

  // Calibar
  @Field({ nullable: true }) calibar: string;
  @Field({ nullable: true }) base_calibar: string;
  @Field({ nullable: true }) power_reserve: number;
  @Field({ nullable: true }) jewels: number;

  // Case
  @Field({ nullable: true }) case_diameter: number;
  @Field({ nullable: true }) water_resistance: number;
  @Field({ nullable: true }) bezel_material: string;
  @Field({ nullable: true }) crystal: string;
  @Field({ nullable: true }) dial: string;
  @Field({ nullable: true }) dial_numbers: string;

  // Bracelet/strap
  @Field({ nullable: true }) bracelet_color: string;
  @Field({ nullable: true }) clasp: string;
  @Field({ nullable: true }) clasp_material: string;

  @Field() created_at?: Date;
  @Field() updated_at?: Date;

  static get tableName() {
    return 'watches';
  }

  static relationMappings = () => ({
    images: {
      relation: Model.HasManyRelation,
      modelClass: Image,
      join: {
        from: 'watches.id',
        to: 'images.watch_id',
      },
    },
    brand: {
      relation: Model.BelongsToOneRelation,
      modelClass: Brand,
      join: {
        from: 'watches.brand_id',
        to: 'brands.id',
      },
    },
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'watches.user_id',
        to: 'users.id',
      },
    },
    order: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'watches.order_id',
        to: 'users.id',
      },
    },
    owner: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'watches.owner_id',
        to: 'users.id',
      },
    },
  });
}
