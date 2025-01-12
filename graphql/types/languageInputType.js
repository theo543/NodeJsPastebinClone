import {GraphQLInputObjectType, GraphQLInt, GraphQLString} from 'graphql'

const languageInputType = new GraphQLInputObjectType({
    name: 'LanguageInput',
    fields: {
        name: { type: GraphQLString }
    }
});

export default languageInputType;