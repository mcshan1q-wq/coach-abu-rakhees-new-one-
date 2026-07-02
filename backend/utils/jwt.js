const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '30d';

function signUserToken(user) {
    return jwt.sign({ id: user.id, type: 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function signAdminToken() {
    return jwt.sign({ type: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = { signUserToken, signAdminToken, verifyToken };
