const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith('Bearer ')
        ? authorization.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // if (payload.role !== 'user') {
        //     return res.status(403).json({ message: 'Admin access required' });
        // }

        req.user = { _id: payload.user, role: payload.role };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticateAdmin;