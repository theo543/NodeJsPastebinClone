import privacyLevelEnum from '../../graphql/enums/privacyLevelEnum.js';
import db from '../../models/index.js';

export const createPaste = async (paste, context) => {
    let dateString;
    if(paste.expiration_time.match(/^\d+$/)) {
        dateString = parseInt(paste.expiration_time);
    } else {
        dateString = paste.expiration_time;
    }
    const expiration_time = new Date(dateString);
    const createdPaste = await db.Paste.create({
        name: paste.name,
        body: paste.body,
        privacy_level: paste.privacy_level,
        expiration_time: expiration_time,
        userId: context.user_id,
        languageId: (paste.languageId || null),
     });

     console.log(expiration_time);

     return createdPaste;
}