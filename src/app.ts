import 'module-alias/register';
import 'reflect-metadata';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
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
app.use(cookieParser());

app.post('/refresh_token', async (req, res) => {
  const token = req.cookies.refresh_token;
  if (!token) {
    return res.send({ message: 'Invalid refresh token' });
  }

  let payload = null;

  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET!) as any;
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

app.use(async (req: any, res, next) => {
  const refreshToken = req.cookies['refresh-token'];
  const accessToken = req.cookies['access-token'];

  if (!refreshToken && !accessToken) {
    return next();
  }

  try {
    const data = verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as any;
    req.userId = data.userId;
    return next();
  } catch {}

  if (!refreshToken) {
    return next();
  }

  let data;

  try {
    data = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as any;
  } catch {
    return next();
  }

  const user = await User.query().findById(data.userId);
  // token has been invalidated
  if (!user || user.count !== data.count) {
    return next();
  }

  const access = createAccessToken(user);
  const refresh = createRefreshToken(user);

  res.cookie('refresh-token', access);
  res.cookie('access-token', refresh);
  req.userId = user.id;

  next();
});

startServer(app);
