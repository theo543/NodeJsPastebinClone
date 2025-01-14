import { GraphQLInt, GraphQLList } from "graphql";
import listPasteService from "../../core/services/listPasteService.js";
import pasteType from "../types/pasteType.js";

const popularPastesQueryResolver = async (_, _args, context) => {
    return await listPasteService(context, null, 'visits');
}

const longestPastesQueryResolver = async (_, _args, context) => {
    return await listPasteService(context, null, 'length');
}

const authorPastesQueryResolver = async (_, { authorId }, context) => {
    return await listPasteService(context, authorId, 'none');
}

const allPastesQueryResolver = async (_, _args, context) => {
    return await listPasteService(context, null, 'none');
}

const pasteListType = new GraphQLList(pasteType);

export const popularPastesQuery = {
    type: pasteListType,
    resolve: popularPastesQueryResolver,
};

export const longestPastesQuery = {
    type: pasteListType,
    resolve: longestPastesQueryResolver,
};

export const authorPastesQuery = {
    type: pasteListType,
    args: {
        authorId: { type: GraphQLInt }
    },
    resolve: authorPastesQueryResolver,
};

export const allPastesQuery = {
    type: pasteListType,
    resolve: allPastesQueryResolver,
};
