import 'module-alias/register';
import 'reflect-metadata';
import 'dotenv/config';
import express, { Application } from 'express';

import cors from 'cors';
import { startServer } from 'graph';
import { Logger, upload } from 'services';
import { resetPassword, refreshToken } from 'controllers';
import { Watch, Image } from 'models';
const app: Application = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(__dirname + '/../uploads'));
// app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

app.get('/reset-password/:token', resetPassword);
app.post('/refresh_token', refreshToken);
app.post('/upload', upload.single('file'), async (req, res) => {
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
});

startServer(app);
