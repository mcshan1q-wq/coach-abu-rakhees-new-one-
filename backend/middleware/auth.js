const { verifyToken } = require('../utils/jwt');

function authenticateUser(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'يجب تسجيل الدخول للوصول إلى هذا المورد' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);

        if (decoded.type !== 'user') {
            return res.status(403).json({ message: 'التوكن غير صالح لهذا المسار' });
        }

        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'الجلسة منتهية، يرجى تسجيل الدخول مرة أخرى' });
    }
}

module.exports = authenticateUser;
