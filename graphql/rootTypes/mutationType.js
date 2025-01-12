import graphql from 'graphql';
import createUserMutation from '../mutations/createUserMutation.js';
import updateUserMutation from '../mutations/updateUserMutation.js';
import deleteUserMutation from '../mutations/deleteUserMutation.js';
import loginMutation from '../mutations/loginMutation.js';
import createPostMutation from '../mutations/createPostMutation.js';
import createInviteMutation from '../mutations/createInviteMutation.js';
import createPasteMutation from '../mutations/createPasteMutation.js';
import createLanguageMutation from '../mutations/createLanguageMutation.js';

// Define the Query type
const queryType = new graphql.GraphQLObjectType({
    name: "Mutation",
    fields: {
        createUser: createUserMutation,
        updateUser: updateUserMutation,
        deleteUser: deleteUserMutation,
        login: loginMutation,
        createPost: createPostMutation,
        createInvite: createInviteMutation,
        createPaste: createPasteMutation,
        createLanguage: createLanguageMutation,
    }
});


export default queryType;