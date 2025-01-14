import userInputType from '../types/userInputType.js';
import db from '../../models/index.js';
import userType from '../types/userType.js';
import bcrypt from 'bcrypt';
import { GraphQLString } from 'graphql';
import createUserService from '../../core/services/createUserService.js';

const createUserMutationResolver = async (_, { inviteToken, user }, context) => {
    const invite = await db.Invite.findOne({
        where: {
            code: inviteToken,
        }
    });

    if(!invite) {
        return false;
    }

    await invite.destroy();

    return await createUserService(user.name, user.password);
}

const createUserMutation = {
    type: userType,
    args: {
        user: {type: userInputType},
        inviteToken: {type: GraphQLString},
    },
    resolve: createUserMutationResolver,
};

export default createUserMutation;
