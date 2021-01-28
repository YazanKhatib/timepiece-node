import { ApolloServer } from 'apollo-server-express';
import { Application } from 'express';
import { Logger } from 'services';
import { buildSchema } from 'type-graphql';
import { initializeDB } from '../database';
import {
  AuthResolver,
  UserResolver,
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
    uploads: true,
    introspection: true,
    playground: true,
  });

  initializeDB();

  server.applyMiddleware({ app });

  app.listen(process.env.PORT || 80, () =>
    Logger.info(
      `🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`,
    ),
  );
};
