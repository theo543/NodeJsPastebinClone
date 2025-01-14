import privacyLevelEnum from '../../graphql/enums/privacyLevelEnum.js';
import db from '../../models/index.js';

export const createPaste = async (paste, context) => {
    const createdPaste = await db.Paste.create({
        name: paste.name,
        body: paste.body,
        privacy_level: paste.privacy_level,
        expiration_time: new Date(paste.expiration_time),
        userId: context.user_id,
        languageId: (paste.languageId || null),
     });

     console.log(new Date(paste.expiration_time));

     return createdPaste;
}