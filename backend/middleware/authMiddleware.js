import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Engineer from '../models/Engineer.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded.role === 'engineer') {
                req.user = await Engineer.findById(decoded.id).select('-password');
                if (req.user) req.user.role = 'engineer'; // Explicitly set role
            } else {
                req.user = await User.findById(decoded.id).select('-password');
            }

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

export const engineerOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'engineer' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an engineer or admin' });
    }
};
