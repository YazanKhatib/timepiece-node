import { isAuth } from 'middlewares';
import { User } from 'models';
import { Logger } from 'services';
import {
  Ctx,
  Arg,
  Query,
  Mutation,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { Context } from '../types';

@Resolver()
export class UserResolver {
  @Query(() => String)
  status() {
    return 'Server is Healthy!';
  }

  @Query(() => User)
  @UseMiddleware(isAuth)
  async me(@Ctx() { payload }: Context) {
    const user = User.query().findById(payload!.userId);
    return user;
  }

  @Mutation(() => User)
  @UseMiddleware(isAuth)
  async updateProfile(
    @Arg('phone', { defaultValue: undefined, nullable: true }) phone: string,
    @Arg('birth', { defaultValue: undefined, nullable: true }) birth: Date,
    @Arg('gender', { defaultValue: undefined, nullable: true }) gender: string,
    @Arg('address', { defaultValue: undefined, nullable: true })
    address: string,
    @Arg('isAdmin', { defaultValue: undefined, nullable: true })
    isAdmin: boolean,
    @Arg('blocked', { defaultValue: undefined, nullable: true })
    blocked: boolean,
    @Arg('last_name', { defaultValue: undefined, nullable: true })
    last_name: string,
    @Arg('first_name', { defaultValue: undefined, nullable: true })
    first_name: string,
    @Ctx() { payload }: Context,
  ) {
    const user = await User.query()
      .findById(payload!.userId)
      .patch({
        phone,
        birth,
        gender,
        address,
        last_name,
        first_name,
        blocked,
        isAdmin,
      })
      .returning('*');

    return user;
  }

  @Mutation(() => Boolean)
  async deleteUsers(@Arg('ids', (type) => [Number]) ids: number[]) {
    try {
      await User.query().delete().whereIn('id', ids);
      return true;
    } catch (e) {
      Logger.error(e.message);
      return false;
    }
  }
}
