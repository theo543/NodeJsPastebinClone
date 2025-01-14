import { GraphQLObjectType } from 'graphql';
import userQuery from '../queries/userQuery.js';
import usersQuery from '../queries/usersQuery.js';
import postQuery from '../queries/postQuery.js';
import pasteQuery from '../queries/PasteQuery.js';
import topLanguagesQuery from '../queries/topLanguagesQuery.js';

const queryType = new GraphQLObjectType({
    name: "Query",
    fields: {
        user: userQuery,
        users: usersQuery,
        post: postQuery,
        paste: pasteQuery,
        topLanguages: topLanguagesQuery,
    },
});


export default queryType;