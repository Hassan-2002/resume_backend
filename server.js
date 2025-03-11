const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const app = require('./app')  
dotenv.config();

const PORT = process.env.PORT || 5000;
connectDB();
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
process.on("unhandledRejection", (error) => {
  console.log(error);
  server.close(() => {
    process.exit(1);
  });
});
