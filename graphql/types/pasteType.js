import {GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLList} from 'graphql'
import userType from './userType.js';
import languageType from './languageType.js';
import privacyLevelEnum from '../enums/privacyLevelEnum.js';

const pasteType = new GraphQLObjectType({
    name: 'Paste',
    fields: {
        id: { type: GraphQLInt },
        privacy_level: { type: privacyLevelEnum },
        expiration_time: { type: GraphQLString },
        name: {type: GraphQLString},
        body: {type: GraphQLString},
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
        author: { 
            type: userType,
            resolve: async (paste) => {
                const user = await paste.getUser();
                return user;
            }
        },
        language: {
            type: languageType,
            resolve: async (paste) => {
                const language = await paste.getLanguage();
                return language;
            }
        }
    }
});

export default pasteType;