// config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interiit-dev';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB Connected to", uri);
  } catch (err) {
    console.error("MongoDB Connection Failed:", err.message);
    process.exit(1); 
  }
};

export default connectDB;
