import languageInputType from '../types/languageInputType.js';
import languageType from '../types/languageType.js';
import db from '../../models/index.js';

const createLanguageMutationResolver = async (_, { language }, context) => {
    const isAuthorized = !!context.user_id && context.isAdmin;
   
    if(!isAuthorized) {
        return false;
    }
    
    const createdLanguage = await db.Language.create({
        name: language.name
    });

    return createdLanguage;
}

const createLanguageMutation = {
    type: languageType,
    args: {
        language: {type: languageInputType},
    },
    resolve: createLanguageMutationResolver,
};

export default createLanguageMutation;