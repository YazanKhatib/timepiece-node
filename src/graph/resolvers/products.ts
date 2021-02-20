import { isAuth } from 'middlewares';
import { Watch, Brand, User } from 'models';
import { Context, WatchResponse } from '../types';

import {
  Arg,
  Query,
  Mutation,
  Resolver,
  UseMiddleware,
  Ctx,
} from 'type-graphql';
import { Logger } from 'services';
import { Model } from 'objection';

@Resolver()
export class ProductResolver {
  @Query(() => WatchResponse)
  @UseMiddleware(isAuth)
  async getProducts(
    @Arg('featured') featured: boolean,
    @Arg('offset', { defaultValue: 0 }) offset: number,
    @Arg('limit', { defaultValue: 10 }) limit: number,
  ) {
    const products = featured
      ? await Watch.query()
          .where('featured', true)
          .where('confirmed', true)
          .page(offset, limit)
          .orderBy('id')
          .withGraphFetched('images')
      : await Watch.query()
          .where('confirmed', true)
          .page(offset, limit)
          .orderBy('id')
          .withGraphFetched('images');
    return products;
  }

  @Query(() => Watch)
  @UseMiddleware(isAuth)
  async getProduct(@Arg('id') id: number) {
    const product = await Watch.query()
      .findOne('id', id)
      .withGraphFetched('images');

    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  @Query(() => [Watch])
  @UseMiddleware(isAuth)
  async getDealerProducts(
    @Arg('status', { nullable: true }) status: 'sale' | 'sold' | 'pending',
    @Arg('confirmed', { defaultValue: true }) confirmed: boolean,
    @Ctx() { payload }: Context,
  ) {
    const user = await User.query().findById(payload!.userId);

    if (user.role !== 'dealer') {
      throw new Error('User is not a dealer!');
    }
    const value = await User.query()
      .findById(payload!.userId)
      .withGraphFetched('watches.images')
      .modifyGraph('watches', (builder) => {
        builder.where('status', status).where('confirmed', confirmed);
      });
    // @ts-ignore
    return value.watches;
  }

  @Query(() => [Watch])
  @UseMiddleware(isAuth)
  async searchProducts(@Arg('brand') brand: string) {
    const products = await Watch.query().withGraphFetched('images');
    const result = products.filter((p) => {
      if (p.name.search(brand.toLowerCase()) !== -1) return p;
    });

    return result;
  }

  @Mutation(() => Watch)
  @UseMiddleware(isAuth)
  async addProduct(
    @Arg('brand') brand: string,
    @Arg('model') model: string,
    @Arg('price') price: number,
    @Arg('delivery') delivery: string,
    @Arg('condition') condition: string,
    @Arg('description') description: string,
    @Arg('location') location: string,
    @Arg('movement', { nullable: true }) movement: string,
    @Arg('case_material', { nullable: true }) case_material: string,
    @Arg('bracelet_material', { nullable: true }) bracelet_material: string,
    @Arg('production_year', { nullable: true }) production_year: number,
    @Arg('gender', { nullable: true }) gender: string,
    @Arg('featured', { nullable: true }) featured: boolean,
    @Arg('certified', { nullable: true }) certified: boolean,

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
    @Ctx() { payload }: Context,
  ) {
    const user = await User.query().findById(payload!.userId);
    if (user.role === 'user') {
      throw new Error('User do not have post permisson!');
    }
    const brandRec = await Brand.query().findOne({ name: brand.toLowerCase() });
    let product;
    await Model.transaction(async (tr) => {
      product = await Watch.query().insert({
        name: brand.toLowerCase(),
        model,
        price,
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
        certified: user.role === 'admin' ? true : false,
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
      await user.$relatedQuery('watches').relate(product);
      await brandRec.$relatedQuery('products').relate(product);

      try {
        await tr.commit();
      } catch (e) {
        await tr.rollback();
        Logger.error(e.message);
      }
    });

    return product;
  }

  @Mutation(() => Watch)
  @UseMiddleware(isAuth)
  async updateProduct(
    @Arg('id') id: string,
    @Arg('brand', { nullable: true }) brand: string,
    @Arg('model', { nullable: true }) model: string,
    @Arg('price', { nullable: true }) price: number,
    @Arg('description', { nullable: true }) description: string,
    @Arg('movement', { nullable: true }) movement: string,
    @Arg('case_material', { nullable: true }) case_material: string,
    @Arg('bracelet_material', { nullable: true }) bracelet_material: string,
    @Arg('production_year', { nullable: true }) production_year: number,
    @Arg('condition', { nullable: true }) condition: string,
    @Arg('delivery', { nullable: true }) delivery: string,
    @Arg('gender', { nullable: true }) gender: string,
    @Arg('location', { nullable: true }) location: string,
    @Arg('featured', { nullable: true }) featured: boolean,
    @Arg('confirmed', { nullable: true }) confirmed: boolean,

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
    const product = await Watch.query()
      .findById(id)
      .patch({
        name: brand,
        model,
        price,
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
        confirmed,
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
      })
      .returning('*');

    return product;
  }

  @Mutation(() => [Watch])
  @UseMiddleware(isAuth)
  async filterProducts(
    @Arg('brand', { nullable: true }) brand: string,
    @Arg('movement', { nullable: true }) movement: string,
    @Arg('case_material', { nullable: true }) case_material: string,
    @Arg('bracelet_material', { nullable: true }) bracelet_material: string,
    @Arg('condition', { nullable: true }) condition: string,
    @Arg('delivery', { nullable: true }) delivery: string,
    @Arg('gender', { nullable: true }) gender: string,
    @Arg('location', { nullable: true }) location: string,
    @Arg('price', () => [Number], { nullable: true }) price: number[],
    @Arg('year', () => [Number], { nullable: true }) year: number[],
  ) {
    const watches = Watch.query()
      .skipUndefined()
      .withGraphFetched('images')
      .where('name', brand)
      .where('gender', gender)
      .where('movement', movement)
      .where('location', location)
      .where('delivery', delivery)
      .where('condition', condition)
      .where('case_material', case_material)
      .where('bracelet_material', bracelet_material);

    if (price?.length) watches.whereBetween('price', [price[0], price[1]]);
    if (year?.length)
      watches.whereBetween('production_year', [year[0], year[1]]);

    return watches;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteProducts(@Arg('ids', () => [Number]) ids: number[]) {
    try {
      await Watch.query().delete().whereIn('id', ids);
      return true;
    } catch (e) {
      Logger.error(e.message);
      return false;
    }
  }
}
