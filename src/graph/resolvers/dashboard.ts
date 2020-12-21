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
import { compare } from 'bcrypt';

@Resolver()
export class DashboardResolver {
  @Query(() => [Watch])
  @UseMiddleware(isAuth)
  async getProducts() {
    const products = await Watch.query();
    return products;
  }

  @Query(() => [User])
  async users() {
    return await User.query();
  }

  @Mutation(() => User)
  @UseMiddleware(isAuth)
  async loginAdmin(
    @Arg('username') username: string,
    @Arg('password') password: string,
  ) {
    const admin = await User.query().findOne('username', username);
    if (!admin) {
      throw new Error('Could not find admin!');
    }

    const valid = await compare(password, admin.password);
    if (!valid) {
      throw new Error('Bad password!');
    }

    return admin;
  }
}
