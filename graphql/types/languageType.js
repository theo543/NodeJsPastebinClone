import {GraphQLObjectType, GraphQLInt, GraphQLString} from 'graphql'

const languageType = new GraphQLObjectType({
    name: 'Language',
    fields: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString }
    }
});

export default languageType;