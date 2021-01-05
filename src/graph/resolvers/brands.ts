import { isAuth } from 'middlewares';
import { Brand, Watch } from 'models';
import { BrandResponse } from '../types';
import { Resolver, Query, Mutation, Arg, UseMiddleware } from 'type-graphql';
import { UniqueViolationError } from 'objection';
import { Logger } from 'services';

@Resolver()
export class BrandResolver {
  @Query(() => BrandResponse)
  @UseMiddleware(isAuth)
  async getBrands(
    @Arg('offset', { defaultValue: 0 }) offset: number,
    @Arg('limit', { defaultValue: 10 }) limit: number,
  ) {
    const brands = await Brand.query().page(offset, limit);
    return brands;
  }

  @Query(() => [Watch])
  @UseMiddleware(isAuth)
  async getBrandProducts(@Arg('brand') brand: string) {
    const products = await (
      await Brand.query().findOne('name', brand.toLowerCase())
    ).$relatedQuery('products');

    return products;
  }

  @Mutation(() => Brand)
  @UseMiddleware(isAuth)
  async createBrand(@Arg('name') name: string) {
    try {
      const brand = await Brand.query().insert({
        name: name.toLowerCase(),
      });
      return brand;
    } catch (e) {
      if (e instanceof UniqueViolationError)
        throw new Error('Brand already exist!');
    }
  }

  @Mutation(() => Brand)
  @UseMiddleware(isAuth)
  async updateBrand(@Arg('id') id: string, @Arg('name') name: string) {
    try {
      const brand = await Brand.query()
        .findById(id)
        .patch({
          name: name.toLowerCase(),
        })
        .returning('*');
      return brand;
    } catch (e) {
      if (e instanceof UniqueViolationError)
        throw new Error('Brand already exist!');
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteBrands(@Arg('ids', (type) => [Number]) ids: number[]) {
    try {
      const value = await Brand.query().delete().whereIn('id', ids);
      return value;
    } catch (e) {
      Logger.error(e.message);
      return false;
    }
  }
}
