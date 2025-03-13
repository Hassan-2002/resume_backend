const User = require("../models/Users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const createToken = (userid) => {
    return jwt.sign({ userid }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}
const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
                required: ["name", "email", "password"]
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                name: user.name,
                email: user.email
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
        console.log("Login Attempt:", email, password);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        // Find user and explicitly select password
        const user = await User.findOne({ email }).select("+password");
        

       
        if (!user) {
            console.log("User not found:", email);
            return res.status(401).json({
                success: false,
                message: "Email not found"
            });
        }

        console.log("User found:", user);
         
        // Compare password
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
       
        if (!isPasswordCorrect) {
            
            return res.status(401).json({
                success: false,
                message: "Incorrect password"
            });
        }
        const token = createToken(user._id);
         
        res.header('Authentication',`Bearer ${token}`);
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                name: user.name,
                email: user.email,
                token: token
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

module.exports = {
    createUser,
    loginUser
};
