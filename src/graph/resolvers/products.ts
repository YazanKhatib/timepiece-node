import { isAuth } from 'middlewares';
import { Watch } from 'models';

import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  UseMiddleware,
} from 'type-graphql';
import { Context } from '../types';

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
  async getFavorites() {
    const products = await Watch.query().where('favorite', true);
    return products;
  }

  @Mutation(() => Watch)
  @UseMiddleware(isAuth)
  async addProduct(
    @Arg('brand') brand: string,
    @Arg('model') model: string,
    @Arg('condition') condition: string,
    @Arg('delivery') delivery: string,
    @Arg('location') location: string,
  ) {
    const product = await Watch.query().insert({
      brand,
      model,
      condition,
      delivery,
      location,
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
}
