import { Model } from 'objection';
import { Image } from 'models';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class Watch extends Model {
  @Field()
  readonly id!: number;

  // Basic info
  @Field() brand: string;
  @Field() model: string;
  @Field() description: string;
  @Field() condition: string;
  @Field() location: string;
  @Field() featured: boolean;
  @Field() confirmed: boolean;
  @Field() delivery: string;
  @Field() price: number;
  @Field() proposed_price: number;
  @Field() production_year: number;
  @Field({ nullable: true }) case_material: string;
  @Field({ nullable: true }) movement: string;
  @Field({ nullable: true }) bracelet_material: string;
  @Field({ nullable: true }) gender: string;

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

  createdAt?: Date;
  updatedAt?: Date;

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
  });
}
