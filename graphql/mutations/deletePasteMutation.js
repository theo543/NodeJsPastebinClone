import db from '../../models/index.js';
import pasteType from '../types/pasteType.js';
import { GraphQLBoolean, GraphQLInt } from 'graphql';

const deletePasteMutationResolver = async (_, args, context) => {
    const isAuthorized = !!context.user_id && (context.isAdmin);
   
    if(!isAuthorized) {
        return false;
    }

    const paste = await db.Paste.findOne({
        where: {
            id: args.pasteId,
        }
    })

    console.log(paste.body + ' ' + paste.userId + ' ' + context.user_id);
    if(!paste || paste.userId != context.user_id) return false;

    await paste.destroy();

    return true;
}

const deletePasteMutation = {
    type: GraphQLBoolean,
    args: {
        pasteId: {type: GraphQLInt},
    },
    resolve: deletePasteMutationResolver,
};

export default deletePasteMutation;