const userModel = require("../models/Users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const COOKIE_NAME = 'session_token';

const createToken = (userid) => {
    return jwt.sign({ userid }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '1d' 
    });
}

const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
          
        if (!name || !email || !password) {
            return res.status(406).json({
                success: false,
                message: "Please provide all required fields",
                required: ["name", "email", "password"]
            });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await userModel.create({
            name,
            email,
            password: hashedPassword
        });
        
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                name: user.name,
                email: user.email,
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "User creation failed",
            error: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }
    
        const user = await userModel.findOne({ email }).select("+password");
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email not found"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password"
            });
        }
        
        const token = createToken(user._id);

        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', 
            maxAge: 1 * 24 * 60 * 60 * 1000
        }); 
    
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                name: user.name,
                email: user.email,
                userId : user._id
            }
        });
    } catch (error) {
        console.log("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message
        });
    }
};

const authUserDetails = async (req, res) => {
    const token = req.cookies[COOKIE_NAME]; 

    if (!token) {
        return res.json({ success: false, message: 'No session token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await userModel.findById(decoded.userid).select("-password");

        if (!user) {
             return res.json({ success: false, message: 'User not found' });
        }

        return res.json({ 
            success: true, 
            message: 'Session valid',
            data: {
                name: user.name,
                email: user.email,
                userId: user._id
            }
        });

    } catch (error) {
        res.clearCookie(COOKIE_NAME, {
             httpOnly: true,
             secure: process.env.NODE_ENV === 'production',
             sameSite: 'none',
        });
        return res.json({ success: false, message: 'Invalid or expired session' });
    }
};


module.exports = {
    createUser,
    loginUser,
    authUserDetails
};
