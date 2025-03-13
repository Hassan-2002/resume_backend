const jwt =  require("jsonwebtoken");
const User = require("../models/Users");

const authenticateUser = (req,res,next) =>{
    const authHeader = req.header('Authentication')
    
    if(!authHeader)
        {
            return res.status(401).json({message:"Invalid token"});
    }
    token = authHeader.split(" ")[1];
   
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = User.findById(decoded.userid);
        next();
    }catch(error){
      
        return res.status(401).json({message:"Invalid token"});
    }
}
module.exports = authenticateUser;