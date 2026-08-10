import { GraphQLObjectType, GraphQLInt, GraphQLBoolean } from "graphql";

const PageInfoType = new GraphQLObjectType({
  name: "PageInfo",
  fields: {
    currentPage: { type: GraphQLInt },
    totalPages: { type: GraphQLInt },
    totalCount: { type: GraphQLInt },
    hasNextPage: { type: GraphQLBoolean },
    hasPreviousPage: { type: GraphQLBoolean },
  },
});

export default PageInfoType;