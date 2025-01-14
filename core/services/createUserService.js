import bcrypt from 'bcrypt';
import db from '../../models/index.js';

const createUserService = async (name, password, isAdmin = false) => {
    const user = await db.User.create({
        name,
        password: await bcrypt.hash(password, 10),
        isAdmin
    });
    return user;
}

export default createUserService;
