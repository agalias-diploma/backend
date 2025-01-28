const request = require('supertest');
const jwt = require('jsonwebtoken');
const db = require('../db');
const User = require('../../models/user');
const app = require('../../app');
const Todo = require('../../models/todos');
const { token } = require('../../scripts/helpers/generateTestToken');

// Setup connection to the database
beforeAll(async () => db.connect());
beforeEach(async () => db.clear());
afterAll(async () => db.close());

describe('User model test', () => {
    it('should add a user', async () => {
        const user = new User({
            firstName: 'Ares',
            lastName: 'Johnson',
            email: 'alexjohnson@gmail.com',
            gender: 'male',
            status: 'active',
        });
        const createdUser = await user.save();

        const todo1 = new Todo({
            id: '643318d996e4f7e12713eb33',
            user_id: '646318d996e4f7e12713eb44',
            title: 'Kate todo',
            due_on: '2023-05-19T18:30:00.000Z',
            status: 'completed',
        });

        await Promise.all([todo1.save()]);

        // Delete the user
        await User.findOneAndRemove({ _id: createdUser._id });

        // Verify that the associated todos have been deleted
        const todos = await Todo.find({ user_id: createdUser._id }).exec();
        expect(todos.length).toBe(0);

        expect(createdUser.email).toEqual('alexjohnson@gmail.com');
        expect(createdUser.firstName).toEqual('Ares');
    });
});

describe('GET /users', () => {
    it('should return an array of users', async () => {
        const response = await request(app)
            .get('/users')
            .set('Authorization', token)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
    });
});
