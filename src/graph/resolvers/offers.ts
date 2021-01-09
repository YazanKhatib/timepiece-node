import { isAuth } from 'middlewares';
import { User, Watch } from 'models';
import { Logger } from 'services';
import {
  Ctx,
  Arg,
  Query,
  Mutation,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { Context, OfferResponse } from '../types';

@Resolver()
export class OfferResolver {
  @Query(() => [OfferResponse])
  @UseMiddleware(isAuth)
  async getOffers() {
    const offers = await User.query().withGraphFetched('offers');
    return offers;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async offerPrice(
    @Arg('id') id: number,
    @Arg('proposed_price') price: number,
    @Ctx() { payload }: Context,
  ) {
    const user = await User.query().findById(payload!.userId);
    if (!user) throw new Error('Could not find User!');

    const watch = await Watch.query().findById(id);
    if (!watch) throw new Error('Could not find watch!');

    await user
      .$relatedQuery('offers')
      //@ts-ignore
      .relate({ id: watch.id, proposed_price: JSON.stringify(price) });

    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async approveOffer(
    @Arg('id') id: number,
    @Arg('watchId') watchId: number,
    @Arg('approved') approved: boolean,
  ) {
    try {
      await User.relatedQuery('offers')
        .for(id)
        // @ts-ignore
        .patch({ approved })
        .where('offers.id', watchId);

      if (approved) {
        await User.relatedQuery('orders').for(id).relate(watchId);
        await Watch.query().findById(watchId).patch({ status: 'sold' });
      }
      return true;
    } catch (e) {
      Logger.error(e.message);
      return false;
    }
  }
}
