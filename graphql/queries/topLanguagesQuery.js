import { GraphQLList } from 'graphql';
import db from '../../models/index.js';
import languageType from '../types/languageType.js';

const topLanguagesQueryResolver = async (_) => {
    const pasteLanguages = await db.Paste.findAll({
        include: {
            model: db.Language,
            attributes: ['name'],
            where: {
                id: db.sequelize.col('Paste.languageId'),
            },
        },
        group: ['Paste.languageId'],
        attributes: [
            [db.sequelize.col('Language.id'), 'id'],
            [db.sequelize.col('Language.name'), 'name'],
        ],
        order: [
            [db.sequelize.fn('COUNT', 'Paste.languageId'), 'DESC'],
        ],
    });
    return pasteLanguages;
};

const topLanguagesQuery = {
    type: new GraphQLList(languageType),
    resolve: topLanguagesQueryResolver,
};

export default topLanguagesQuery;
