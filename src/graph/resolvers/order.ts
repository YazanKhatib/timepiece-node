import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { isAuth } from 'middlewares';
import { User, Watch } from 'models';
import { Context, OrderResponse } from '../types';
import { Logger } from 'services';

@Resolver()
export class OrderResolver {
  @Query(() => [OrderResponse])
  @UseMiddleware(isAuth)
  async getOrders() {
    const orders = await User.query().withGraphFetched('orders');
    console.log('orders', orders);
    return orders;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async submitOrder(
    @Ctx() { payload }: Context,
    @Arg('watchId') watchId: number,
  ) {
    const user = await User.query().findById(payload!.userId);
    const watch = await Watch.query().findById(watchId);
    if (watch.status !== 'sale')
      throw new Error('Watch is not available for purchase');

    await Watch.query().findById(watchId).patch({ status: 'pending' });

    try {
      await user.$relatedQuery('orders').relate(watch);
      return true;
    } catch (e) {
      Logger.error(e.message);
      return false;
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async approveOrder(
    @Arg('watchId') watchId: number,
    @Arg('approved') approved: boolean,
  ) {
    try {
      if (approved)
        await Watch.query().findById(watchId).patch({ status: 'sold' });
      return true;
    } catch (e) {
      Logger.error(e.message);
      return false;
    }
  }
}
