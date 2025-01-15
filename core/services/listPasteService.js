import db from '../../models/index.js';

const listPaste = async (context, target_user_id, sort_kind) => {
    let queryParams = {
        where: {
            [db.Sequelize.Op.or]: [
                // public pastes can be listed by anyone
                { privacy_level: 'PUBLIC' },
            ],
        },
    };
    if(!!context.user_id) {
        // if logged in, user can see their own pastes even if not public
        queryParams.where[db.Sequelize.Op.or].push({ userId: context.user_id });
    }
    if(!!target_user_id) {
        // if target_user_id is given, only show pastes of that user
        queryParams.where.userId = target_user_id;
    }
    switch (sort_kind) {
        case 'length':
            queryParams.order = [[db.Sequelize.fn('LENGTH', db.Sequelize.col('body')), 'DESC']];
            break;
        case 'visits':
            queryParams.order = [['visits', 'DESC']];
            break;
        case 'none':
            break;
        default:
            throw new Error('Invalid sort kind');
    }

    const pastes = await db.Paste.findAll(queryParams);
    return pastes;
}

export default listPaste;
