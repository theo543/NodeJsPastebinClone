import userInputType from '../types/userInputType.js';
import db from '../../models/index.js';
import userType from '../types/userType.js';
import bcrypt from 'bcrypt';
import { GraphQLString } from 'graphql';

const createUserMutationResolver = async (_, { inviteToken, user }, context) => {
    const password = await bcrypt.hash(user.password, 5);

    const invite = await db.Invite.findOne({
        where: {
            code: inviteToken,
        }
    });

    if(!invite) {
        return false;
    }

    await invite.destroy();

    const createdUser = await db.User.create({
        name: user.name,
        password: password,
    });

    return createdUser;
    
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
