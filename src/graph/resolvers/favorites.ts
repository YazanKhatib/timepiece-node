import { isAuth } from 'middlewares';
import { User, Watch } from 'models';
import { Context } from '../types';

import {
  Ctx,
  Arg,
  Query,
  Mutation,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { Logger } from 'services';

@Resolver()
export class FavoriteResolver {
  @Query(() => [Watch])
  @UseMiddleware(isAuth)
  async getFavorites(@Ctx() { payload }: Context) {
    const user = await User.query().findById(payload!.userId).orderBy('id');
    if (!user) {
      throw new Error('Could not find user!');
    }

    const favorites = await user
      .$relatedQuery('favorites')
      .withGraphFetched('images');
    return favorites;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async toggleFavorite(@Ctx() { payload }: Context, @Arg('id') id: number) {
    const user = await User.query().findById(payload!.userId);
    if (!user) {
      throw new Error('Could not find user!');
    }

    const watch = await Watch.query().findOne('id', id);
    if (!watch) {
      throw new Error('Could not find watch!');
    }

    const exist = await user
      .$relatedQuery('favorites')
      .where('watches.id', watch.id);

    if (!exist.length) {
      //@ts-ignore
      await user.$relatedQuery('favorites').relate({ id: watch.id });
      return true;
    } else {
      await user
        .$relatedQuery('favorites')
        .unrelate()
        .where('watches.id', watch.id);
      return false;
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async checkFavorite(@Ctx() { payload }: Context, @Arg('id') id: number) {
    try {
      const user = await User.query()
        .findById(payload!.userId)
        .withGraphFetched('favorites');
      const watch = await Watch.query().findById(id);

      //@ts-ignore
      const result = user.favorites.find((pro) => pro.id === watch.id);
      return result === undefined ? false : true;
    } catch (e) {
      Logger.error(e.message);
      return false;
    }
  }
}
