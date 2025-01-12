import pasteType from '../types/pasteType.js';
import pasteInputType from '../types/pasteInputType.js';
import { createPaste } from '../../core/services/createPasteService.js';

const createPasteMutationResolver = async (_, { paste }, context) => {
    const isAuthorized = !!context.user_id
   
    if(!isAuthorized) {
        return false;
    }

    const createdPaste = await createPaste(paste, context);

    return createdPaste;
}

const createPasteMutation = {
    type: pasteType,
    args: {
        paste: {type: pasteInputType},
    },
    resolve: createPasteMutationResolver,
};

export default createPasteMutation;