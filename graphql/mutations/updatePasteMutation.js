import db from '../../models/index.js';
import pasteType from '../types/pasteType.js';
import pasteInputType from '../types/pasteInputType.js';
import { GraphQLInt } from 'graphql';

const updatePasteMutationResolver = async (_, args, context) => {
    const isAuthorized = !!context.user_id;
    if(!isAuthorized) {
        return false;
    }

    const paste = await db.Paste.findOne({
        where: {
            id: args.pasteId,
        }
    })

    if(!paste) return false;
    if(paste.userId != context.user_id) {
        console.log("You cannot modify a paste that is not yours");
        return false;
    }
    const updatedPaste = await paste.update({
        ...args.paste,
    });

    return updatedPaste;
}

const updatePasteMutation = {
    type: pasteType,
    args: {
        pasteId: {type: GraphQLInt},
        paste: {type: pasteInputType},
    },
    resolve: updatePasteMutationResolver,
};

export default updatePasteMutation;