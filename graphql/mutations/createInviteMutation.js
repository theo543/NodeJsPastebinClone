import { randomBytes } from 'crypto';
import { GraphQLString } from 'graphql';
import db from '../../models/index.js';

const createInviteMutationResolver = async (_, _args, context) => {
    const isAuthorized = !!context.user_id && context.isAdmin;

    if(!isAuthorized) {
        return false;
    }

    const inviteToken = randomBytes(22).toString('base64').slice(0, 30);

    const createdInvite = await db.Invite.create({
        code: inviteToken,
    });

    return createdInvite.code;
}

const createInviteMutation = {
    type: GraphQLString,
    resolve: createInviteMutationResolver,
};

export default createInviteMutation;
