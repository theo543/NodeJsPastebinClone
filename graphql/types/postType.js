import {GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLList} from 'graphql'
import userType from './userType.js';
import tagType from './tagType.js';

const postType = new GraphQLObjectType({
    name: 'Post',
    fields: {
        id: { type: GraphQLInt },
        title: { type: GraphQLString },
        body: { type: GraphQLString },
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
        author: { 
            type: userType,
            resolve: async (post) => {
                const user = await post.getUser();

                return user;
            }
        },
        tags: {
            type: new GraphQLList(tagType),
            resolve: async (post) => {
                const tags = await post.getTags();

                return tags;
            }
        }
    }
});

export default postType;