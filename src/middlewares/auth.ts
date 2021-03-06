import { MiddlewareFn } from 'type-graphql';
import { Context } from 'graph/types';
import { verify } from 'jsonwebtoken';
import { Logger } from 'services';

export const isAuth: MiddlewareFn<Context> = ({ context }, next) => {
  const authorization = context.req.headers['authorization'];

  if (!authorization) {
    throw new Error('not authenticated!');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
    context.payload = payload as any;
  } catch (err) {
    Logger.error(err);
    throw new Error('not authenticated!');
  }

  return next();
};
