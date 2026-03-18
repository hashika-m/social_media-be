
import jwt from 'jsonwebtoken'


const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token) {
            return res.status(401).json({ message: 'Token is not found' })
        }

        const verifyToken = await jwt.verify(token, process.env.JWT_SECRET)

        req.userId = verifyToken.userId
        next()
    } catch (error) {
        console.log("AUTH ERROR:", error.message);
        return res.status(401).json({ message: 'Authentication failed' });
    }
}

export default authMiddleware
