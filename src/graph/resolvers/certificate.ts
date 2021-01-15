import { User, Certificate } from 'models';
import { CertificateResponse, Context } from '../types';
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { Logger } from 'services';
import { isAuth } from 'middlewares';

@Resolver()
export class CertificateResolver {
  @Query(() => [CertificateResponse])
  @UseMiddleware(isAuth)
  async getCertificates() {
    return await Certificate.query().withGraphFetched('user');
  }

  @Query(() => Boolean)
  @UseMiddleware(isAuth)
  async submitCertificate(@Ctx() { payload }: Context) {
    const user = await User.query().findById(payload!.userId);
    if (user.role !== 'dealer') {
      throw new Error('User  do not have permission');
    }

    try {
      //@ts-ignore
      await user.$relatedQuery('requests').insert({ fulfilled: false });
      return true;
    } catch (e) {
      Logger.error(e.message);
      return false;
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async fulfillCertificate(@Arg('id') id: number) {
    try {
      await Certificate.query().findById(id).patch({
        fulfilled: true,
      });

      return true;
    } catch (e) {
      Logger.error(e.message);
      return false;
    }
  }
}
