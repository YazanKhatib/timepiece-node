import { ApolloServer } from 'apollo-server-express';
import { Application } from 'express';
import { Logger } from 'services';
import { buildSchema } from 'type-graphql';
import { initializeDB } from '../database';
import {
  AuthResolver,
  UserResolver,
  BrandResolver,
  ProductResolver,
  DashboardResolver,
  FavoriteResolver,
} from './resolvers/index';

export const startServer = async (app: Application) => {
  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        AuthResolver,
        UserResolver,
        BrandResolver,
        ProductResolver,
        FavoriteResolver,
        DashboardResolver,
      ],
    }),
    context: ({ req, res }) => ({ req, res }),
    uploads: false,
    introspection: true,
    playground: true,
  });

  initializeDB();

  server.applyMiddleware({ app });

  app.listen(process.env.PORT || 4000, () =>
    Logger.info(
      `🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`,
    ),
  );
};
