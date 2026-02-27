import User from '../models/User.js';
import Engineer from '../models/Engineer.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, location } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            location,
            role: 'user' // Only normal users can register
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                location: user.location,
                token: generateToken(user._id, user.role)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body; // Role is expected from login dropdown/selection if applicable, or we search both

        // To make it simple, we can search User first, if not found and role is engineer, search Engineer
        let account = await User.findOne({ email });
        let isEngineer = false;

        if (!account) {
            account = await Engineer.findOne({ email });
            isEngineer = !!account;
        }

        if (account && (await account.matchPassword(password))) {
            const actualRole = isEngineer ? 'engineer' : account.role;
            
            res.json({
                _id: account._id,
                name: account.name,
                email: account.email,
                role: actualRole,
                ...(isEngineer ? { assignedZone: account.assignedZone } : { location: account.location }),
                token: generateToken(account._id, actualRole)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
