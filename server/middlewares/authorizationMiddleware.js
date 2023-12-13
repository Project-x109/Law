const authorize = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user; 
        console.log("Logged in is ", user)
        if (!user) {
            return res.status(401).json({ error: "Unauthorized - User not authenticated" });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ error: "Forbidden - Insufficient permissions" });
        }

        next();
    };
};

module.exports = authorize;