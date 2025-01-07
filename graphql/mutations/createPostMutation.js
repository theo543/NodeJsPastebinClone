import postType from '../types/postType.js';
import postInputType from '../types/postInputType.js';
import { createPost } from '../../core/services/createPostService.js';

const createPostMutationResolver = async (_, { post }, context) => {
    const isAuthorized = !!context.user_id
   
    if(!isAuthorized) {
        return false;
    }
    
    const createdPost = await createPost(post, context);

    return createdPost;
}

const createPostMutation = {
    type: postType,
    args: {
        post: {type: postInputType},
    },
    resolve: createPostMutationResolver,
};

export default createPostMutation;