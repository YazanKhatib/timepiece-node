import { Request, Response } from 'express';
import { User, Brand, Watch } from 'models';
import { ObjectType, Field } from 'type-graphql';

export interface Context {
  req: Request;
  res: Response;
  payload?: { userId: string };
}

@ObjectType()
export class LoginResponse {
  @Field()
  user: User;

  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}
@ObjectType()
export class UserResponse {
  @Field()
  total: number;
  @Field(() => [User])
  results: User[];
}

@ObjectType()
export class BrandResponse {
  @Field()
  total: number;
  @Field(() => [Brand])
  results: Brand[];
}

@ObjectType()
export class WatchResponse {
  @Field()
  total: number;
  @Field(() => [Watch])
  results: Watch[];
}
