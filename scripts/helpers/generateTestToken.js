const jwt = require('jsonwebtoken');

// Generate access token for testing
const generateTestToken = () => {
    const payload = { user: { id: '67900d333123123cd0c0b0a1' } };
    return jwt.sign(payload, 'secretKey');
};
const token = generateTestToken();

module.exports = {
    token,
};
