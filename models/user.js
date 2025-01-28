const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
    id: mongoose.ObjectId,
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        match: /.+\@.+\..+/,
        unique: true,
    },
    gender: {
        type: String,
        required: true,
        enum: {
            values: ['male', 'female'],
            message: '{VALUE} is not supported',
        },
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['active', 'inactive'],
            message: '{VALUE} is not supported',
        },
    },
});

module.exports = mongoose.model('users', userSchema);
