const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Define a new instance of "MongoMemoryServer" to automatically start server
let mongoServer;

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

// Provide connection to a new in-memory database server
const connect = async () => {
    await mongoose.disconnect();

    // Spin up actual/real MongoDB server programatically from node, for testing
    mongoServer = await MongoMemoryServer.create();

    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri, options);
};

// Remove and close database and server
const close = async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
};

// Remove all data from collections
const clear = async () => {
    const { collections } = mongoose.connection;

    for (const key in collections) {
        const collection = collections[key];
        collection.deleteMany();
    }
};

module.exports = {
    connect,
    close,
    clear,
};
