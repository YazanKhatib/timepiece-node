import 'module-alias/register';
import 'reflect-metadata';
import 'dotenv/config';
import express, { Application } from 'express';

import cors from 'cors';
import { startServer } from 'graph';
import { upload } from 'services';
import { resetPassword, refreshToken, uploadImage } from 'controllers';
const app: Application = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(__dirname + '/../uploads'));

app.get('/reset-password/:token', resetPassword);
app.post('/refresh_token', refreshToken);
app.post('/upload', upload.single('file'), uploadImage);

startServer(app);
