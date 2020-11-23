import { sign } from 'jsonwebtoken';
import { User } from 'models';
import randomatic from 'randomatic';

export const createAccessToken = (user: User) => {
  const accessToken = sign(
    { userId: user.id },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: '15m',
    },
  );

  return accessToken;
};

export const createRefreshToken = (user: User) => {
  const refreshToken = sign(
    { userId: user.id, count: user.count },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: '7d',
    },
  );

  return refreshToken;
};

export const createConfirmationCode = (id: number) => {
  // Generate a 6 digit numeric OTP

  const otp = randomatic('0', 6);
  const token = sign(
    {
      userId: id,
    },
    otp,
    {
      expiresIn: '2m',
    },
  );

  return { otp, token };
};
