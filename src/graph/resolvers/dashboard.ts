import { User } from 'models';
import { UserResponse } from '../types';

import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import { compare } from 'bcrypt';
@Resolver()
export class DashboardResolver {
  @Query(() => UserResponse)
  async getUsers(
    @Arg('dealer') dealer: boolean,
    @Arg('offset', { defaultValue: 0 }) offset: number,
    @Arg('limit', { defaultValue: 10 }) limit: number,
  ) {
    const users = dealer
      ? await User.query().where('dealer', true).page(offset, limit)
      : await User.query().where('dealer', false).page(offset, limit);

    return users;
  }

  @Mutation(() => User)
  async loginAdmin(
    @Arg('username') username: string,
    @Arg('password') password: string,
  ) {
    const admin = await User.query().findOne('username', username);
    if (!admin || !admin.isAdmin) {
      throw new Error('Could not find admin!');
    }

    const valid = await compare(password, admin.password);
    if (!valid) {
      throw new Error('Bad password!');
    }

    return admin;
  }
}
