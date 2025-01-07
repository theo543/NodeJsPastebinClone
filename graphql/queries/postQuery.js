import {GraphQLInt} from 'graphql';
import db from '../../models/index.js';
import postType from '../types/postType.js';

const postQueryResolver = async (_, { id }) => {
    const post = await db.Post.findOne({
        where: {
            id,
        }
    });

    if(!post) {
        return null;
    }

    return post;
}

const postQuery = {
    type: postType,
    args: {
        id: { type: GraphQLInt },
    },
    resolve: postQueryResolver,
};

export default postQuery;