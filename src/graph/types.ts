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
  @Field() user: User;
  @Field() accessToken: string;
  @Field() refreshToken: string;
}
@ObjectType()
export class UserResponse {
  @Field() total: number;
  @Field(() => [User]) results: User[];
}

@ObjectType()
export class BrandResponse {
  @Field() total: number;
  @Field(() => [Brand]) results: Brand[];
}

@ObjectType()
export class WatchResponse {
  @Field() total: number;
  @Field(() => [Watch]) results: Watch[];
}

@ObjectType()
export class OfferResponse {
  @Field() readonly id!: number;
  @Field() username!: string;
  @Field() email: string;
  @Field() blocked: boolean;
  @Field() confirmed: boolean;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) birth: Date;
  @Field({ nullable: true }) gender: string;
  @Field({ nullable: true }) address: string;
  @Field({ nullable: true }) first_name: string;
  @Field({ nullable: true }) last_name: string;
  @Field({ defaultValue: 'user' }) role: 'sale' | 'sold' | 'pending';
  @Field((type) => [Watch]) offers: Watch[];
}
@ObjectType()
export class OrderResponse {
  @Field() readonly id!: number;
  @Field() username!: string;
  @Field() email: string;
  @Field() blocked: boolean;
  @Field() confirmed: boolean;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) birth: Date;
  @Field({ nullable: true }) gender: string;
  @Field({ nullable: true }) address: string;
  @Field({ nullable: true }) first_name: string;
  @Field({ nullable: true }) last_name: string;
  @Field({ defaultValue: 'user' }) role: 'sale' | 'sold' | 'pending';
  @Field((type) => [Watch]) orders: Watch[];
}

@ObjectType()
export class CertificateResponse {
  @Field() readonly id!: number;
  @Field() fulfilled!: boolean;
  @Field({ nullable: true }) created_at: Date;
  @Field({ nullable: true }) updated_at: Date;
  @Field() user: User;
}
