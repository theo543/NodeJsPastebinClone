import {GraphQLObjectType, GraphQLInt, GraphQLString} from 'graphql'

const tagType = new GraphQLObjectType({
    name: 'Tag',
    fields: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString }
    }
});

export default tagType;