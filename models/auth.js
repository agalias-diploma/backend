const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    google: {
        id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
    },
    createdAt: { type: Date, default: Date.now },
});

const User = model('AuthUser', UserSchema);

module.exports = User;
