import { Watch, Image } from 'models';
import { Logger } from 'services';

export const uploadImage = async (req: any, res: any) => {
  const { id } = req.headers;
  try {
    const watch = await Watch.query().findById(id!);
    if (!watch) {
      return res.send({
        upload: false,
        message: 'Watch not found!',
      });
    }
    const images = await watch.$relatedQuery('images');

    const image = await Image.query().insert({
      url: req.file.path,
      main: images.length ? false : true,
    });

    await watch.$relatedQuery('images').relate(image);
    res.send({
      upload: true,
    });
  } catch (e) {
    Logger.error(e.message);
  }
};
