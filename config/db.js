const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();  // This should be at the very top


const connect = async () => {
      try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected`);
    }
      catch(error){
        console.log(error);
      }
}

module.exports = connect