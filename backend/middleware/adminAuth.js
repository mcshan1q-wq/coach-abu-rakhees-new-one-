const { verifyToken } = require('../utils/jwt');

function authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'يجب تسجيل دخول الأدمن للوصول إلى هذا المورد' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);

        if (decoded.type !== 'admin') {
            return res.status(403).json({ message: 'صلاحيات غير كافية للوصول إلى لوحة الأدمن' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ message: 'جلسة الأدمن منتهية، يرجى تسجيل الدخول مرة أخرى' });
    }
}

module.exports = authenticateAdmin;
