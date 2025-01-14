import graphql from 'graphql';
import userInputType from '../types/userInputType.js';
import userType from '../types/userType.js';
import db from '../../models/index.js';

const updateUserMutationResolver = async (_, args, context) => {
    const id = args.id;

    const authorized = !!context.user_id && (context.isAdmin || context.user_id == id);
    if(!authorized) {
        return false;
    }

    const user = await db.User.findOne({
        where: {
            id,
        }
    });

    if(!user) {
        return false;
    }

    const updatedUser = await user.update({
        ...args.user,
    });

    return updatedUser;
}

const updateUserMutation = {
    type: userType,
    args: {
        id: {type: graphql.GraphQLInt},
        user: {type: userInputType},
    },
    resolve: updateUserMutationResolver,
};

export default updateUserMutation;