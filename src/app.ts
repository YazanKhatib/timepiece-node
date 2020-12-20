import 'module-alias/register';
import 'reflect-metadata';
import 'dotenv/config';
import express, { Application } from 'express';
import { verify } from 'jsonwebtoken';

import { User } from 'models';
import { startServer } from 'graph';
import { createAccessToken, createRefreshToken, Logger } from 'services';
import cors from 'cors';
const app: Application = express();

// app.use(
//   cors({
//     origin: 'http://localhost:4000',
//     credentials: true,
//   }),
// );

app.use(cors());

app.post('/refresh_token', async (req, res) => {
  const { refresh_token: token } = req.headers;
  Logger.info(['token', token]);
  if (!token) {
    return res.send({ message: 'Invalid refresh token' });
  }

  let payload = null;

  try {
    payload = verify(token as any, process.env.REFRESH_TOKEN_SECRET!) as any;
  } catch (e) {
    Logger.error(e);
    return res.send({ message: 'Invalid refresh token' });
  }

  const user = await User.query().findById(payload.userId);
  if (!user || user.count !== payload.count) {
    return res.send({ message: 'Invalid refresh token' });
  }

  const accessToken = createAccessToken(user);
  res.cookie('refresh-token', createRefreshToken(user));
  return res.send({ accessToken });
});

startServer(app);
