const { ObjectId } = require('mongoose').Types;
const User = require('../models/user');
const { formatName } = require('../scripts/helpers/nameFormatter');

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
};

const addUser = async (req, res) => {
    try {
        const { name, email, gender, status } = req.body;
        const { firstName, lastName } = formatName(name);

        const newUser = new User({ firstName, lastName, email, gender, status });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error in addUser end-point');
    }
};

const getUserByID = async (req, res) => {
    try {
        const { _id } = req.params;
        if (!ObjectId.isValid(_id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error in getUserByID');
    }
};

const updateUser = async (req, res) => {
    const { _id } = req.params;
    if (!ObjectId.isValid(_id)) {
        return res.status(406).json({ error: 'Invalid ID' });
    }

    const { firstName, lastName, email, gender, status } = req.body;
    const obj = new User({ firstName, lastName, email, gender, status });
    const errors = obj.validateSync();
    if (errors) {
        res.status(400).json(errors);
    }
    try {
        const user = await User.findByIdAndUpdate(
            _id,
            { firstName, lastName, email, gender, status },
            { new: true },
        );
        if (!user) {
            res.status(404).json({ error: 'User not found' });
        } else {
            return res.status(200).json(user);
        }
    } catch (error) {
        console.log(error);
    }
};

const deleteUser = async (req, res) => {
    const { _id } = req.params;
    if (!ObjectId.isValid(_id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    try {
        const user = await User.findByIdAndRemove(_id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.status(200).json(user);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error in deleteUser end-point');
    }
};

module.exports = {
    getUsers,
    addUser,
    getUserByID,
    updateUser,
    deleteUser,
};
