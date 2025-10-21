const jwt = require("jsonwebtoken");
const User = require("../models/Users"); 

const authenticateUser = async (req, res, next) => 
    {   
      const {session_token} =  req.cookies;
    

      if(!session_token){
        return res.status(400).json({success : false , message : "auth failed"})
        }

    try {
        const decoded = jwt.verify( `${session_token}`, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userid);
        if (!req.user) {
            console.log(`User with ID ${decoded.userid} not found in DB.`);
            return res.status(401).json({ message: "User not found or invalid token." });
        }
        next();

    } catch (error) {
        console.error("Token verification or user lookup failed:", error.message); 
    }
};

module.exports = authenticateUser;