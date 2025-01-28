const mongoose = require('mongoose');
require('dotenv').config();

async function connectToDb() {
    await mongoose.connect(process.env.DB_CONNECTION);
}

mongoose.connection.on('error', err => {
    console.log(err);
});

module.exports = () =>
    connectToDb()
        .then(() => console.log('Connected to MongoDB Atlas'))
        .catch(console.log);
