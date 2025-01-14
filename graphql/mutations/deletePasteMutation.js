import db from '../../models/index.js';
import pasteType from '../types/pasteType.js';
import { GraphQLBoolean, GraphQLInt } from 'graphql';

const deletePasteMutationResolver = async (_, args, context) => {
    if(!context.user_id) {
        return false;
    }

    const paste = await db.Paste.findOne({
        where: {
            id: args.pasteId,
        }
    })

    if(!paste || (paste.userId != context.user_id && !context.isAdmin)) {
        console.log("You cannot delete a paste that is not yours");
        return false;
    }

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