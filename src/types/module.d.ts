import { Secret } from 'jsonwebtoken';

declare namespace NodeJS {
  export interface ProcessEnv {
    TOKEN_SECRET: Secret;
  }
}
