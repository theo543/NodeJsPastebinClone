import {GraphQLInputObjectType, GraphQLList, GraphQLString} from 'graphql'

const postInputType = new GraphQLInputObjectType({
    name: 'PostInput',
    fields: {
        title: { type: GraphQLString },
        body: { type: GraphQLString },
        tags: { type: new GraphQLList(GraphQLString) }
    }
});

export default postInputType;