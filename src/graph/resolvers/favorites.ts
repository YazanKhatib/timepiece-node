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

@Resolver()
export class FavoriteResolver {
  @Query(() => [Watch])
  @UseMiddleware(isAuth)
  async getFavorites(@Ctx() { payload }: Context) {
    const user = await User.query().findById(payload!.userId).orderBy('id');
    if (!user) {
      throw new Error('Could not find user!');
    }

    const favorites = await user.$relatedQuery('favorites');
    return favorites;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async toggleFavorite(@Ctx() { payload }: Context, @Arg('id') id: string) {
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
}
