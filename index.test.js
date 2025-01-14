import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http, { createServer } from 'node:http';
import app from './app.js';
import db from './models/index.js';
import createUserService from './core/services/createUserService.js';

let server;
const PORT = 3001;

// Function to query graphql
const queryGraphql = (data = null, token = null) => {
    if(data !== null) {
      data = { query: data };
    }
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        let options = {
            method: 'POST',
            hostname: 'localhost',
            port: PORT,
            path: '/graphql',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
            },
        };
        if(token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                console.log('test:request:debug', body);
                res.body = JSON.parse(body || '{}');

                resolve(res);
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
};

server = createServer(app);

let admin;
let user1;
let user2;

async function createUser(name) {
    const invite = (await queryGraphql("mutation { createInvite }", admin.token)).body.data.createInvite;
    const user = (await queryGraphql(`mutation { createUser(user: {name: "${name}", password: "${name}"}, inviteToken: "${invite}") { id, name } }`, admin.token)).body.data.createUser;
    assert.strictEqual(user.name, name);
    const token = (await queryGraphql(`mutation { login(credentials: {username: "${name}", password: "${name}"}) { token } }`)).body.data.login.token;
    assert.ok(token);
    return { id: user.id, name, token };
}

// Start the server before tests, and stop it after
before(async () => {
    // clear users table to remove any leftovers from previous tests
    await db.User.destroy({ where: {} });

    server.listen(PORT); // Start the server before tests
    const adminId = (await createUserService('admin', 'admin', true)).id;
    const adminToken = (await queryGraphql('mutation { login(credentials: {username: "admin", password: "admin"}) { token } }')).body.data.login.token;
    assert.ok(adminToken);
    admin = { id: adminId, name: 'admin', token: adminToken };
    user1 = await createUser('user1');
    user2 = await createUser('user2');
});

after(() => {
    server.close(); // Stop the server after all tests
});

describe('Find users', () => {
  test('should find users', async () => {
    for (const user of [admin, user1, user2]) {
        const res = await queryGraphql(`{ user(id: ${user.id}) { id, name } }`);

        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.body.data.user.name, user.name);
    }
  });
  test('should return null for user not found', async () => {
    const res = await queryGraphql('{ user(id: 999999) { id, name } }');

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.user, null);
  });
});

describe('E2 - List users', () => {
  test('should list all users', async () => {
      const res = await queryGraphql({ query: '{ users {id, name} }' });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.data.users.length, 2);
      assert.strictEqual(res.body.data.users[0].name, 'John');
      assert.strictEqual(res.body.data.users[1].name, 'Mary');
  });
});

describe('E3 - create user', () => {
  test('should create a new user', async () => {
      const res = await queryGraphql({ query: `mutation CreateUser { createUser(user: {name: "Example"}) }` });

      assert.strictEqual(res.statusCode, 200);
      console.log('test:body', res.body);

      const resList = await queryGraphql({ query: '{ users {id, name} }' });
      assert.strictEqual(resList.body.data.users.length, 3);
      assert.strictEqual(resList.body.data.users[2].name, 'Example');
  });
});

describe('E4 - update user', () => {
  test('should update an existing user', async () => {
      const res = await queryGraphql({ query: `mutation UpdateUser { updateUser(id: 1, user: {name: "Jean"}) {id, name} }` });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.data.updateUser.name, 'Jean');
  });

  test('should not update an non-existing user', async () => {
    const res = await queryGraphql({ query: `mutation UpdateUser { updateUser(id: 999, user: {name: "Jean"}) {id, name} }` });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.updateUser, null);
});
});

describe('E5 - delete user', () => {
  test('should delete an existing user', async () => {
      const res = await queryGraphql({ query: `mutation DeleteUser { deleteUser(id: 1) }` });

      assert.strictEqual(res.statusCode, 200);

      const resList = await queryGraphql({ query: '{ users {id, name} }' });
      assert.notStrictEqual(resList.body.data.users[0].name, 'Jean');
      assert.notStrictEqual(resList.body.data.users[0].name, 'John');
  });

  test('should not delete an non-existing user', async () => {
    const res = await queryGraphql({ query: `mutation DeleteUser { deleteUser(id: 9999) }` });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.deleteUser, null);
});
});



process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  process.exit(1);
});
