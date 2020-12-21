import { isAuth } from 'middlewares';
import { User, Watch } from 'models';
import { Context } from '../types';

import {
  Resolver,
  Query,
  Mutation,
  Arg,
  UseMiddleware,
  Ctx,
} from 'type-graphql';

@Resolver()
export class ProductResolver {
  @Query(() => [Watch])
  @UseMiddleware(isAuth)
  async getProducts() {
    const products = await Watch.query();
    return products;
  }

  @Query(() => Watch)
  @UseMiddleware(isAuth)
  async getProduct(@Arg('id') id: number) {
    const product = await Watch.query().findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  @Query(() => [Watch])
  @UseMiddleware(isAuth)
  async getFeatured() {
    const products = await Watch.query().where('featured', true);
    return products;
  }

  @Query(() => [Watch])
  @UseMiddleware(isAuth)
  async getFavorites(@Ctx() { payload }: Context) {
    const user = await User.query().findById(payload!.userId);
    if (!user) {
      throw new Error('Could not find user!');
    }

    const favorites = await user.$relatedQuery('favorites');
    return favorites;
  }

  @Mutation(() => Watch)
  @UseMiddleware(isAuth)
  async addProduct(
    @Arg('brand') brand: string,
    @Arg('model') model: string,
    @Arg('description') description: string,
    @Arg('movement') movement: string,
    @Arg('case_material') case_material: string,
    @Arg('bracelet_material') bracelet_material: string,
    @Arg('production_year') production_year: number,
    @Arg('condition') condition: string,
    @Arg('delivery') delivery: string,
    @Arg('gender') gender: string,
    @Arg('location') location: string,
    @Arg('featured') featured: boolean,

    // Calibar Optional
    @Arg('calibar', { nullable: true }) calibar: string,
    @Arg('base_calibar', { nullable: true }) base_calibar: string,
    @Arg('power_reserve', { nullable: true }) power_reserve: number,
    @Arg('jewels', { nullable: true }) jewels: number,

    // Case Optional
    @Arg('case_diameter', { nullable: true }) case_diameter: number,
    @Arg('water_resistance', { nullable: true }) water_resistance: number,
    @Arg('bezel_material', { nullable: true }) bezel_material: string,
    @Arg('crystal', { nullable: true }) crystal: string,
    @Arg('dial', { nullable: true }) dial: string,
    @Arg('dial_numbers', { nullable: true }) dial_numbers: string,

    // Bracelet/strap Optional
    @Arg('bracelet_color', { nullable: true }) bracelet_color: string,
    @Arg('clasp', { nullable: true }) clasp: string,
    @Arg('clasp_material', { nullable: true }) clasp_material: string,
  ) {
    const product = await Watch.query().insert({
      brand,
      model,
      description,
      movement,
      case_material,
      bracelet_material,
      production_year,
      condition,
      delivery,
      gender,
      location,
      featured,
      calibar,
      base_calibar,
      power_reserve,
      jewels,
      case_diameter,
      water_resistance,
      bezel_material,
      crystal,
      dial,
      dial_numbers,
      bracelet_color,
      clasp,
      clasp_material,
    });

    return product;
  }

  @Mutation(() => Watch)
  @UseMiddleware(isAuth)
  async updateProduct(@Arg('id') id: string) {
    const product = await Watch.query().findById(id).patch({});

    return product;
  }

  @Mutation(() => Watch)
  @UseMiddleware(isAuth)
  async deleteProduct(@Arg('id') id: string) {
    const product = await Watch.query().deleteById(id);

    return product;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async toggleFavorite(@Ctx() { payload }: Context, @Arg('id') id: string) {
    const user = await User.query().findById(payload!.userId);
    if (!user) {
      throw new Error('Could not find user!');
    }

    const watch = await Watch.query().findOne('id', id);
    if (!watch) {
      throw new Error('Could not find watch!');
    }

    const exist = await user
      .$relatedQuery('favorites')
      .where('watches.id', watch.id);

    if (!exist.length) {
      //@ts-ignore
      await user.$relatedQuery('favorites').relate({ id: watch.id });
      return true;
    } else {
      //@ts-ignore
      await user
        .$relatedQuery('favorites')
        .unrelate()
        .where('watches.id', watch.id);
      return false;
    }
  }
}
