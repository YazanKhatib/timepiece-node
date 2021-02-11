import { User } from 'models';
import { hash } from 'bcrypt';
import { verify } from 'jsonwebtoken';
import { createAccessToken, createRefreshToken, Logger } from 'services';
import { Request, Response } from 'express';

export const refreshToken = async (req: Request, res: Response) => {
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
  const refreshToken = createRefreshToken(user);
  return res.send({ accessToken, refreshToken });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { password, confirm } = req.body;
  const { token } = req.params;

  if (!token) {
    return res.send({
      message: 'Bad request!',
    });
  }
  try {
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);

    if (password === undefined || confirm === undefined)
      return res.send({
        message: 'Password and confirm password are required',
      });

    if (password !== confirm)
      return res.send({
        message: 'Passwords do not match!',
      });

    const hashedPassword = await hash(password, 10);
    // @ts-ignore
    await User.query().findById(payload.userId).patch({
      password: hashedPassword,
    });

    return res.send({
      message: 'sucesss',
    });
  } catch (e) {
    Logger.error(e.message);
    return res.send({
      message: 'Bad request!',
    });
  }
};
