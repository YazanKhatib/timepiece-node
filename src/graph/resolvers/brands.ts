import { isAuth } from 'middlewares';
import { Brand } from 'models';

import { Resolver, Query, Mutation, Arg, UseMiddleware } from 'type-graphql';

@Resolver()
export class BrandResolver {
  @Query(() => [Brand])
  @UseMiddleware(isAuth)
  async getBrands() {
    const brands = await Brand.query();
    return brands;
  }

  @Mutation(() => Brand)
  @UseMiddleware(isAuth)
  async createBrand(@Arg('name') name: string) {
    const brand = await Brand.query().insert({
      name,
    });
    return brand;
  }

  @Mutation(() => Brand)
  @UseMiddleware(isAuth)
  async updateBrand(@Arg('id') id: string, @Arg('name') name: string) {
    const brand = await Brand.query()
      .findById(id)
      .patch({
        name,
      })
      .returning('*');

    return brand;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteBrand(@Arg('id') id: string) {
    try {
      const value = await Brand.query().deleteById(id);
      return value;
    } catch (e) {
      return false;
    }
  }
}
