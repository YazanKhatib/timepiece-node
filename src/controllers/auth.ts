import { User } from 'models';
import { hash } from 'bcrypt';
import { verify } from 'jsonwebtoken';
import { createAccessToken, createRefreshToken, Logger } from 'services';

export const refreshToken = async (req: any, res: any) => {
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

export const resetPassword = async (req: any, res: any) => {
  const { password, confirm } = req.body;
  if (password !== confirm)
    return res.send({
      message: 'Passwords do not match!',
    });

  try {
    const hashedPassword = await hash(password, 10);
    await User.query().findById(1).patch({
      password: hashedPassword,
    });
  } catch (e) {
    Logger.error(e.message);
  }

  return res.sendFile(__dirname + '/reset.html');
};
