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
let textId;
let jsId;

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
    // clear tables to remove any leftovers from previous tests
    await db.Invite.destroy({ where: {} });
    await db.Paste.destroy({ where: {} });
    await db.User.destroy({ where: {} });
    await db.Language.destroy({ where: {} });

    textId = (await db.Language.create({ name: 'Text' })).id;
    jsId = (await db.Language.create({ name: 'JavaScript' })).id;

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

      const token = (await queryGraphql(`mutation { login(credentials: {username: "Example", password: "Example"}) { token } }`)).body.data.login.token;
      assert.ok(token);

      const resUpdate = await queryGraphql(`mutation UpdateUser { updateUser(id: ${user.id}, user: {name: "Example2"}) {id, name} }`, token);
      assert.strictEqual(resUpdate.body.data.updateUser.name, 'Example2');

      const resQuery = await queryGraphql(`{ user(id: ${user.id}) { id, name } }`);
      assert.strictEqual(resQuery.body.data.user.name, 'Example2');

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

describe("Authorization", () => {
  test('Admin can create invites', async () => {
    const invite = (await queryGraphql("mutation { createInvite }", admin.token)).body.data.createInvite;
    assert.ok(invite);
  });
  test('Non-admin cannot create invites', async () => {
    const invite = (await queryGraphql("mutation { createInvite }", user1.token)).body.data.createInvite;
    assert.strictEqual(invite, "false");
  });
  test('User cannot delete other users', async () => {
    const res = await queryGraphql(`mutation DeleteUser { deleteUser(id: ${user2.id}) }`, user1.token);
    assert.strictEqual(res.body.data.deleteUser, false);
  });
  test('User cannot update other users', async () => {
    const res = await queryGraphql(`mutation UpdateUser { updateUser(id: ${user2.id}, user: {name: "should not work"}) {id, name} }`, user1.token);
    assert.deepEqual(res.body.data.updateUser, { id: null, name: null });
  });
  test('Admin can update and delete other users', async () => {
    const user = await createUser('user3');
    const resUpdate = await queryGraphql(`mutation UpdateUser { updateUser(id: ${user.id}, user: {name: "new name"}) {id, name} }`, admin.token);
    assert.deepEqual(resUpdate.body.data.updateUser, { id: user.id, name: 'new name' });
    const resDelete = await queryGraphql(`mutation DeleteUser { deleteUser(id: ${user.id}) }`, admin.token);
    assert.ok(resDelete.body.data.deleteUser);
  });
});

async function createPaste(name, body, privacy_level, expiration_time, languageId, token, assertGood = true) {
  const res = await queryGraphql(`mutation CreatePaste { createPaste(paste: {name: "${name}", body: "${body}", privacy_level: ${privacy_level}, expiration_time: "${expiration_time}", languageId: ${languageId}}) { id, name, body, privacy_level, expiration_time, language { id, name } } }`, token);
  if(assertGood) {
    assert.ok(res.body.data.createPaste.id);
  }
  return res.body.data.createPaste;
}

async function genericPasteWithDate(token) {
  const date = `${Date.now() + 1000 * 60 * 60 * 24 * 7}`;
  return [date, await createPaste('test paste', 'test body', 'PUBLIC', date, textId, token)];
}

async function genericPaste(token) {
  return (await genericPasteWithDate(token))[1];
}

describe("Paste management", () => {
  test('Can create, query, update, and delete paste', async () => {
    const [date, paste] = await genericPasteWithDate(user1.token);
    assert.deepEqual(paste, { id: paste.id, name: 'test paste', body: 'test body', privacy_level: 'PUBLIC', expiration_time: date, language: { id: textId, name: 'Text' } });
    const resQuery = await queryGraphql(`{ paste(id: ${paste.id}) { id, name, body, privacy_level, expiration_time, language { id, name } } }`);
    assert.deepEqual(resQuery.body.data.paste, { id: paste.id, name: 'test paste', body: 'test body', privacy_level: 'PUBLIC', expiration_time: date, language: { id: textId, name: 'Text' } });
    const resUpdate = await queryGraphql(`mutation UpdatePaste { updatePaste(pasteId: ${paste.id}, paste: {name: "new name", body: "new body", privacy_level: PRIVATE, expiration_time: "${date}", languageId: ${jsId}}) { id, name, body, privacy_level, expiration_time, language { id, name } } }`, user1.token);
    assert.deepEqual(resUpdate.body.data.updatePaste, { id: paste.id, name: 'new name', body: 'new body', privacy_level: 'PRIVATE', expiration_time: date, language: { id: jsId, name: 'JavaScript' } });
    const resDelete = await queryGraphql(`mutation DeletePaste { deletePaste(pasteId: ${paste.id}) }`, user1.token);
    assert.ok(resDelete.body.data.deletePaste);
    const badQuery = await queryGraphql(`{ paste(id: ${paste.id}) { id, name } }`);
    assert.strictEqual(badQuery.body.data.paste, null);
  });
  test('Cannot update or delete other users pastes unless admin', async () => {
    const paste = await genericPaste(user1.token);
    const badUpdate = await queryGraphql(`mutation UpdatePaste { updatePaste(pasteId: ${paste.id}, paste: {name: "new name", body: "new body", privacy_level: PRIVATE, expiration_time: "${Date.now() + 1000 * 60 * 60 * 24 * 7}", languageId: ${jsId}}) { id, name, body, privacy_level, expiration_time, language { id, name } } }`, user2.token);
    assert.deepEqual(badUpdate.body.data.updatePaste, { id: null, name: null, body: null, privacy_level: null, expiration_time: null, language: null });
    const badDelete = await queryGraphql(`mutation DeletePaste { deletePaste(pasteId: ${paste.id}) }`, user2.token);
    assert.strictEqual(badDelete.body.data.deletePaste, false);
    const goodUpdate = await queryGraphql(`mutation UpdatePaste { updatePaste(pasteId: ${paste.id}, paste: {name: "new name", body: "new body", privacy_level: PRIVATE, expiration_time: "${Date.now() + 1000 * 60 * 60 * 24 * 7}", languageId: ${jsId}}) { id, name, body, privacy_level, expiration_time, language { id, name } } }`, admin.token);
    assert.ok(goodUpdate.body.data.updatePaste.id);
    const goodDelete = await queryGraphql(`mutation DeletePaste { deletePaste(pasteId: ${paste.id}) }`, admin.token);
    assert.ok(goodDelete.body.data.deletePaste);
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
