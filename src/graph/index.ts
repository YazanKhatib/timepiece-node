import { ApolloServer } from 'apollo-server-express';
import { Application } from 'express';
import { Logger } from 'services';
import { buildSchema } from 'type-graphql';
import { initializeDB } from '../database';
import {
  AuthResolver,
  UserResolver,
  ImageResolver,
  OrderResolver,
  OfferResolver,
  BrandResolver,
  ProductResolver,
  DashboardResolver,
  FavoriteResolver,
  CertificateResolver,
} from './resolvers/index';

export const startServer = async (app: Application) => {
  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        AuthResolver,
        UserResolver,
        ImageResolver,
        OrderResolver,
        OfferResolver,
        BrandResolver,
        ProductResolver,
        FavoriteResolver,
        DashboardResolver,
        CertificateResolver,
      ],
    }),
    context: ({ req, res }) => ({ req, res }),
    uploads: false,
    introspection: true,
    playground: true,
  });

  initializeDB();

  server.applyMiddleware({ app });

  app.listen(80, () =>
    Logger.info(
      `🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`,
    ),
  );
};
