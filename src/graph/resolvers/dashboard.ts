import { isAuth } from 'middlewares';
import { User } from 'models';

import { Resolver, Query, Mutation, Arg, UseMiddleware } from 'type-graphql';
import { compare } from 'bcrypt';

@Resolver()
export class DashboardResolver {
  @Query(() => [User])
  async users(@Arg('dealer') dealer: boolean) {
    const users = dealer
      ? await User.query().where('dealer', true)
      : await User.query();
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
