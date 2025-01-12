import {GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLString} from 'graphql'
import privacyLevelEnum from '../enums/privacyLevelEnum.js';

const pasteInputType = new GraphQLInputObjectType({
    name: 'PasteInput',
    fields: {
        privacy_level: { type: privacyLevelEnum },
        expiration_time: { type: GraphQLString },
        name: { type: GraphQLString },
        body: { type: GraphQLString },
        language_id: { type: GraphQLInt }
    }
});

export default pasteInputType;