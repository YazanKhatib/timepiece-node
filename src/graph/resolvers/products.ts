import { isAuth } from 'middlewares';
import { User, Watch, Image, Brand } from 'models';
import { Context, WatchResponse } from '../types';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';

import {
  Ctx,
  Arg,
  Query,
  Mutation,
  Resolver,
  UseMiddleware,
} from 'type-graphql';

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
      ? await Watch.query().where('featured', true).page(offset, limit)
      : await Watch.query().page(offset, limit);
    return products;
  }

  @Query(() => Watch)
  @UseMiddleware(isAuth)
  async getProduct(@Arg('id') id: number) {
    const product = await Watch.query()
      .findOne('id', id)
      .withGraphFetched('images');

    console.log(product);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  @Query(() => [Watch])
  @UseMiddleware(isAuth)
  async searchProducts(@Arg('brand') brand: string) {
    const products = await Watch.query();
    const result = products.filter((p) => {
      if (p.name.search(brand) !== -1) return p;
    });

    return result;
  }

  @Query(() => [User])
  @UseMiddleware(isAuth)
  async getOffers() {
    const offers = await User.query().withGraphFetched('offers');
    return offers;
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
    const bbrand = await Brand.query().findOne({ name: brand.toLowerCase() });
    const product = await Watch.query().insert({
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
    await bbrand.$relatedQuery('products').relate(product);
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
    @Arg('model', { nullable: true }) model: string,
    @Arg('movement', { nullable: true }) movement: string,
    @Arg('case_material', { nullable: true }) case_material: string,
    @Arg('bracelet_material', { nullable: true }) bracelet_material: string,
    @Arg('production_year', { nullable: true }) production_year: number,
    @Arg('condition', { nullable: true }) condition: string,
    @Arg('delivery', { nullable: true }) delivery: string,
    @Arg('gender', { nullable: true }) gender: string,
    @Arg('location', { nullable: true }) location: string,

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
    const watches = Watch.query()
      .where('brand', brand)
      .where('model', model)
      .where('movement', movement)
      .where('case_material', case_material)
      .where('bracelet_material', bracelet_material)
      .where('production_year', production_year)
      .where('condition', condition)
      .where('delivery', delivery)
      .where('gender', gender)
      .where('location', location)
      .where('calibar', calibar)
      .where('base_calibar', base_calibar)
      .where('power_reserve', power_reserve)
      .where('case_diameter', case_diameter)
      .where('water_resistance', water_resistance)
      .where('bezel_material', bezel_material)
      .where('crystal', crystal)
      .where('dial', dial)
      .where('dial_numbers', dial_numbers)
      .where('bracelet_color', bracelet_color)
      .where('clasp', clasp)
      .where('clasp_material', clasp_material);

    return watches;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteProduct(@Arg('id') id: string) {
    try {
      await Watch.query().deleteById(id);
      return true;
    } catch (e) {
      return false;
    }
  }

  @Mutation(() => Boolean)
  async addPicture(
    // @Arg('id') id: string,
    @Arg('picture', () => GraphQLUpload)
    { createReadStream, filename }: FileUpload,
  ) {
    const loc = __dirname + `/../../../uploads/${filename}`;
    createReadStream().pipe(createWriteStream(loc));

    const watch = await Watch.query().findById(1);
    const images = await watch.$relatedQuery('images');
    console.log({ images });

    const image = await Image.query().insert({
      url: loc,
      main: images.length ? true : false,
    });

    console.log({ image });
    await watch.$relatedQuery('images').relate(image);

    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async offerPrice(
    @Arg('id') id: string,
    @Arg('proposed_price') price: number,
    @Ctx() { payload }: Context,
  ) {
    const user = await User.query().findById(payload!.userId);

    const watch = await Watch.query().findById(id);

    await user
      .$relatedQuery('offers')
      //@ts-ignore
      .relate({ id: watch.id, proposed_price: JSON.stringify(price) });

    return true;
  }
}
