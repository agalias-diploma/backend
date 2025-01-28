const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const User = require('../../models/user');
const { formatName } = require('../../scripts/helpers/nameFormatter');
const { token } = require('../../scripts/helpers/generateTestToken');

afterEach(() => {
    jest.clearAllMocks();
});

jest.mock('../../models/user');

// Get all users test
const mockUsers = [
    {
        _id: '6439201d3abd69b3f43458ee',
        firstName: 'Max',
        lastName: 'Maxiim',
        email: 'max156@co.com',
        gender: 'male',
        status: 'active',
    },
];

describe('GET /users', () => {
    it('should return all users from mongoDB', async () => {
        jest.spyOn(User, 'find').mockResolvedValue(mockUsers);

        const res = await request(app).get('/users').set('Authorization', token);
        expect(res.status).toEqual(200);
        expect(User.find).toHaveBeenCalledTimes(1);
        expect(res.body).toEqual(mockUsers);
    });
    it('should return error on server error', async () => {
        jest.spyOn(User, 'find').mockRejectedValue(new Error('Server Error'));
        const res = await request(app).get('/users').set('Authorization', token);

        expect(res.statusCode).toEqual(500);
        expect(User.find).toHaveBeenCalledTimes(1);
    });
});

// updating
const mockUser = {
    _id: '6439201d3abd69b3f43458ee',
    firstName: 'Max',
    lastName: 'Maxiim',
    email: 'max156@co.com',
    gender: 'male',
    status: 'active',
};
const updatedUser = {
    firstName: 'Alex',
    lastName: 'Fergusson',
    email: 'alexferg@gmail.com',
    gender: 'male',
    status: 'active',
};
const wrongUser = {
    firstName: 'Alex',
    lastName: 'Fergusson',
    email: 'alexferg.com',
    gender: 'fff',
    status: 'fff',
};

const UserMockImplementation = (id, updateUserObj, validateObj) =>
    User.mockImplementation(() => ({
        id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        gender: mockUser.gender,
        status: mockUser.status,
        save: jest.fn().mockResolvedValueOnce(updateUserObj),
        validateSync: jest.fn().mockReturnValueOnce(validateObj),
    }));

const createMockedUser = {
    name: 'Test Testing',
    email: 'testtest@gmail.com',
    gender: 'female',
    status: 'inactive',
};
describe('POST /users', () => {
    it('should create a user', async () => {
        const { firstName, lastName } = formatName(createMockedUser.name);
        UserMockImplementation(11, createMockedUser, createMockedUser);

        const res = await request(app)
            .post('/users')
            .set('Authorization', token)
            .send(createMockedUser);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual(createMockedUser);
    });

    it('should handle server errors while creating of user', async () => {
        const missedData = {
            email: 'testtest@gmail.com',
            gender: 'female',
            status: 'inactive',
        };

        const res = await request(app).post('/users').set('Authorization', token).send(missedData);
        expect(res.statusCode).toEqual(500);
        expect(res.text).toEqual('Server error in addUser end-point');
    });
});

// Get user by id test
describe('GET /users/:_id', () => {
    it('should find user by id', async () => {
        const mockFindById = jest.spyOn(User, 'findById'); // mock mongoose method findById
        mockFindById.mockResolvedValueOnce(mockUsers);

        const res = await request(app)
            .get('/users/6439201d3abd69b3f43458ee')
            .set('Authorization', token);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(mockUsers);
        expect(mockFindById).toHaveBeenCalledTimes(1);
        expect(mockFindById).toHaveBeenCalledWith('6439201d3abd69b3f43458ee');
    });

    it('should return an error for an invalid ID', async () => {
        const res = await request(app).get('/users/aaa').set('Authorization', token);
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({ error: 'Invalid ID' });
    });

    it('should return an error if user not found', async () => {
        const mockFindById = jest.spyOn(User, 'findById');
        mockFindById.mockResolvedValueOnce(null);

        const res = await request(app)
            .get('/users/6439205d7abd69b3f43433ee')
            .set('Authorization', token);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({ error: 'User not found' });
        expect(mockFindById).toHaveBeenCalledTimes(1);
        expect(mockFindById).toHaveBeenCalledWith('6439205d7abd69b3f43433ee');
    });

    it('should return server error', async () => {
        const mockFindById = jest.spyOn(User, 'findById');
        mockFindById.mockRejectedValueOnce(new Error('Server error'));

        const res = await request(app)
            .get('/users/6777777d7abd69b3f43433ee')
            .set('Authorization', token);
        expect(res.statusCode).toEqual(500);
        expect(res.text).toEqual('Server error in getUserByID');
        expect(mockFindById).toHaveBeenCalledTimes(1);
        expect(mockFindById).toHaveBeenCalledWith('6777777d7abd69b3f43433ee');
    });
});

describe('DELETE /users/:_id', () => {
    it('should delete a user and their todos', async () => {
        User.findById.mockResolvedValue(mockUser);
        User.findByIdAndRemove.mockResolvedValue(mockUser);
        const res = await request(app)
            .delete('/users/6439201d3abd69b3f43458ee')
            .set('Authorization', token);
        expect(res.statusCode).toEqual(200);
        expect(User.findByIdAndRemove).toHaveBeenCalledWith('6439201d3abd69b3f43458ee');
    });
    it('should find user by id and delete', async () => {
        const mockFindByIdAndRemove = jest.spyOn(User, 'findByIdAndRemove');
        mockFindByIdAndRemove.mockResolvedValueOnce(mockUsers);

        const res = await request(app)
            .delete('/users/6439201d3abd69b3f43458ee')
            .set('Authorization', token);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(mockUsers);
        expect(mockFindByIdAndRemove).toHaveBeenCalledTimes(1);
        expect(mockFindByIdAndRemove).toHaveBeenCalledWith('6439201d3abd69b3f43458ee');
    });

    it('should return a 400 error', async () => {
        const res = await request(app).delete('/users/wrongid').set('Authorization', token);
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({ error: 'Invalid ID' });
    });

    it('should return user not found 404 error', async () => {
        const mockFindByIdAndRemove = jest.spyOn(User, 'findByIdAndRemove');
        mockFindByIdAndRemove.mockResolvedValueOnce(null);

        const res = await request(app)
            .delete('/users/1111201d3abd69b3f43458ee')
            .set('Authorization', token);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({ error: 'User not found' });
        expect(mockFindByIdAndRemove).toHaveBeenCalledTimes(1);
        expect(mockFindByIdAndRemove).toHaveBeenCalledWith('1111201d3abd69b3f43458ee');
    });

    it('should return server error', async () => {
        const mockFindByIdAndRemove = jest.spyOn(User, 'findByIdAndRemove');
        mockFindByIdAndRemove.mockRejectedValueOnce(new Error('Server error'));

        const res = await request(app)
            .delete('/users/6411111d7abd69b3f43433ee')
            .set('Authorization', token);
        expect(res.statusCode).toEqual(500);
        expect(res.text).toEqual('Server error in deleteUser end-point');
        expect(mockFindByIdAndRemove).toHaveBeenCalledTimes(1);
        expect(mockFindByIdAndRemove).toHaveBeenCalledWith('6411111d7abd69b3f43433ee');
    });
});

describe('PUT /users/:_id', () => {
    it('should update and return user', async () => {
        const mockFindByIdAndUpdate = jest.spyOn(User, 'findByIdAndUpdate');
        mockFindByIdAndUpdate.mockResolvedValueOnce(mockUser);
        UserMockImplementation(mockUser.id, updatedUser, null);

        const res = await request(app)
            .put('/users/6439201d3abd69b3f43458ee')
            .set('Authorization', token)
            .send(updatedUser);
        expect(res.statusCode).toEqual(200);
        expect(mockFindByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(res.body).toEqual(mockUser);
        expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
            '6439201d3abd69b3f43458ee',
            updatedUser,
            {
                new: true,
            },
        );
    });
    it('should return user not found error', async () => {
        const mockFindByIdAndUpdate = jest.spyOn(User, 'findByIdAndUpdate');
        mockFindByIdAndUpdate.mockResolvedValueOnce();

        const res = await request(app)
            .put('/users/6999901d3abd69b3f43458ee')
            .set('Authorization', token);
        expect(res.statusCode).toEqual(404);
        expect(mockFindByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(res.text).toEqual('{"error":"User not found"}');
    });

    it('should return validateSync errors', async () => {
        const mockFindByIdAndUpdate = jest.spyOn(User, 'findByIdAndUpdate');
        mockFindByIdAndUpdate.mockResolvedValueOnce(mockUser);
        UserMockImplementation(mockUser.id, wrongUser, wrongUser);

        const res = await request(app)
            .put('/users/6439201d3abd69b3f43458ee')
            .set('Authorization', token)
            .send(wrongUser);
        expect(res.statusCode).toEqual(400);
        expect(res.text).toEqual(
            '{"firstName":"Alex","lastName":"Fergusson","email":"alexferg.com","gender":"fff","status":"fff"}',
        );
    });

    it('should return Invalid ID error', async () => {
        const mockFindByIdAndUpdate = jest.spyOn(User, 'findByIdAndUpdate');
        mockFindByIdAndUpdate.mockResolvedValueOnce();
        UserMockImplementation(111, wrongUser, wrongUser);

        const res = await request(app)
            .put('/users/111')
            .set('Authorization', token)
            .send(wrongUser);
        expect(res.statusCode).toEqual(406);
        expect(res.text).toEqual('{"error":"Invalid ID"}');
    });
});
