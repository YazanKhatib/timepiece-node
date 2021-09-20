import { User } from 'models';
import { compare } from 'bcrypt';
import { LoginResponse, UserResponse } from '../types';

import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import {
  createAccessToken,
  createRefreshToken,
  Logger,
  notify,
} from 'services';

@Resolver()
export class DashboardResolver {
  @Query(() => UserResponse)
  async getUsers(
    @Arg('dealer') dealer: boolean,
    @Arg('offset', { defaultValue: 0 }) offset: number,
    @Arg('limit', { defaultValue: 10 }) limit: number,
  ) {
    const users = dealer
      ? await User.query()
          .where('role', 'dealer')
          .page(offset, limit)
          .orderBy('id')
      : await User.query()
          .where('role', 'user')
          .page(offset, limit)
          .orderBy('id');

    return users;
  }

  @Query(() => User)
  async getUser(@Arg('id') id: number) {
    const user = User.query().findById(id);
    if (!user) {
      throw new Error('Could not find user!');
    }
    return user;
  }

  @Mutation(() => User)
  async updateUserbyId(
    @Arg('id') id: number,
    @Arg('phone', { defaultValue: undefined, nullable: true }) phone: string,
    @Arg('birth', { defaultValue: undefined, nullable: true }) birth: Date,
    @Arg('gender', { defaultValue: undefined, nullable: true }) gender: string,
    @Arg('address', { defaultValue: undefined, nullable: true })
    address: string,
    @Arg('role', { defaultValue: undefined, nullable: true })
    role: 'user' | 'dealer' | 'admin',
    @Arg('confirmed', { defaultValue: undefined, nullable: true })
    confirmed: boolean,
    @Arg('blocked', { defaultValue: undefined, nullable: true })
    blocked: boolean,
    @Arg('last_name', { defaultValue: undefined, nullable: true })
    last_name: string,
    @Arg('first_name', { defaultValue: undefined, nullable: true })
    first_name: string,
  ) {
    const user = await User.query()
      .findById(id)
      .patch({
        phone,
        birth,
        gender,
        address,
        last_name,
        first_name,
        confirmed,
        blocked,
        role,
      })
      .returning('*');

    return user;
  }

  @Mutation(() => LoginResponse)
  async loginAdmin(
    @Arg('username') username: string,
    @Arg('password') password: string,
  ) {
    const admin = await User.query().findOne('username', username);
    if (!admin || admin.role !== 'admin') {
      throw new Error('Could not find admin!');
    }

    const valid = await compare(password, admin.password);
    if (!valid) {
      throw new Error('Wrong password!');
    }

    return {
      user: admin,
      accessToken: createAccessToken(admin),
      refreshToken: createRefreshToken(admin),
    };
  }

  @Mutation(() => Boolean)
  async sendNotification(
    @Arg('title') title: string,
    @Arg('body') body: string,
  ) {
    try {
      const users = await User.query().whereNot('fcm_token', null);
      await Promise.all(
        users.map(async (user: any) => {
          await notify(user.fcm_token, title, body);
        }),
      );

      return true;
    } catch (e) {
      Logger.error(e.message);
      return false;
    }
  }
}
