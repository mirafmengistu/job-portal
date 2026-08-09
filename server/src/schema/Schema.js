import { GraphQLSchema } from "graphql";
import RootQuery from "../graphql/queries/RootQuery.js";
import rootMutation from "../graphql/mutations/rootMutation.js";

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: rootMutation,
});

export default schema;