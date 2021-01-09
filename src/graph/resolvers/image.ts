import { Image, Watch } from 'models';
import { Arg, Resolver, Mutation } from 'type-graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';

@Resolver()
export class ImageResolver {
  @Mutation(() => Boolean)
  async addPicture(
    // @Arg('id') id: string,
    @Arg('picture', () => GraphQLUpload)
    { createReadStream, filename }: FileUpload,
  ) {
    const loc = __dirname + `/../../../uploads/${filename}`;
    createReadStream().pipe(createWriteStream(loc));

    const watch = await Watch.query().findById(1);
    const images = await watch.$relatedQuery('images');
    console.log({ images });

    const image = await Image.query().insert({
      url: loc,
      main: images.length ? true : false,
    });

    console.log({ image });
    await watch.$relatedQuery('images').relate(image);

    return true;
  }
}
