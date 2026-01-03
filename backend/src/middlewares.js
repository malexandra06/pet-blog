export const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(401).json({ message: "Login please!" });
        }
        return res.redirect('/login');
    }
    next();
};