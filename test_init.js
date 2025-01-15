import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.assert(process.env.NODE_ENV === 'test');

if (!fs.existsSync("test.sqlite")) {
    execSync('npx sequelize db:migrate', { stdio: 'inherit' });
}
