import { Image, Watch } from 'models';
import { Arg, Resolver, Mutation } from 'type-graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import { Logger } from 'services';

@Resolver()
export class ImageResolver {
  @Mutation(() => Boolean)
  async addPicture(
    @Arg('id') id: number,
    @Arg('picture', () => GraphQLUpload)
    { createReadStream, filename }: FileUpload,
  ) {
    try {
      const loc = __dirname + `/../../../uploads/${filename}`;
      createReadStream().pipe(createWriteStream(loc));

      const watch = await Watch.query().findById(id);
      const images = await watch.$relatedQuery('images');

      const image = await Image.query().insert({
        url: loc,
        main: images.length ? false : true,
      });

      await watch.$relatedQuery('images').relate(image);

      return true;
    } catch (e) {
      Logger.error(e.message);
      return false;
    }
  }
}
