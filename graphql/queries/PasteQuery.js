import {GraphQLInt} from 'graphql';
import db from '../../models/index.js';
import pasteType from '../types/pasteType.js';

const pasteQueryResolver = async (_, { id }) => {
    const paste = await db.Paste.findOne({
        where: {
            id,
        }
    });

    if(!paste) {
        return null;
    }

    await paste.increment('visits', { by: 1 });

    return paste;
}

const pasteQuery = {
    type: pasteType,
    args: {
        id: { type: GraphQLInt },
    },
    resolve: pasteQueryResolver,
};

export default pasteQuery;