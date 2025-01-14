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

describe('List users', () => {
  test('should list all users', async () => {
      const res = await queryGraphql('{ users { id, name } }');

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.data.users.length, 3);
      for (const user of [admin, user1, user2]) {
        assert.ok(res.body.data.users.find(u => u.id === user.id && u.name === user.name));
      }
    });
});

describe('User management', () => {
  test('should create, update, and delete a new user', async () => {
      const invite = (await queryGraphql("mutation { createInvite }", admin.token)).body.data.createInvite;
      const user = (await queryGraphql(`mutation CreateUser { createUser(user: { name: "Example", password: "Example" }, inviteToken: "${invite}") { id, name } }`, admin.token)).body.data.createUser;

      const resList = await queryGraphql('{ users {id, name} }');
      assert.strictEqual(resList.body.data.users.length, 4);
      assert.strictEqual(resList.body.data.users[3].name, 'Example');

      const resUpdate = await queryGraphql(`mutation UpdateUser { updateUser(id: ${user.id}, user: {name: "Example2"}) {id, name} }`);
      assert.strictEqual(resUpdate.body.data.updateUser.name, 'Example2');

      const resQuery = await queryGraphql(`{ user(id: ${user.id}) { id, name } }`);
      assert.strictEqual(resQuery.body.data.user.name, 'Example2');

      const token = (await queryGraphql(`mutation { login(credentials: {username: "Example2", password: "Example"}) { token } }`)).body.data.login.token;
      assert.ok(token);

      // new user should not be able to create invites
      const badInvite = (await queryGraphql("mutation { createInvite }", token)).body.data.createInvite;
      assert.strictEqual(badInvite, "false");

      const resDelete = await queryGraphql(`mutation DeleteUser { deleteUser(id: ${user.id}) }`, token);
      assert.ok(resDelete.body.data.deleteUser);

      const badQuery = await queryGraphql(`{ user(id: ${user.id}) { id, name } }`);
      assert.strictEqual(badQuery.body.data.user, null);
  });

  test('should not update an non-existing user', async () => {
    const res = await queryGraphql(`mutation UpdateUser { updateUser(id: 999, user: {name: "Jean"}) {id, name} }`);
    assert.deepEqual(res.body.data.updateUser, { id: null, name: null });
  });

  test('should not delete an non-existing user', async () => {
    const res = await queryGraphql(`mutation DeleteUser { deleteUser(id: 9999) }`);
    assert.strictEqual(res.body.data.deleteUser, false);
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
