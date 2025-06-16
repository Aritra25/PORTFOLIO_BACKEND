import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    // console.log(mongoURI)
    if (!mongoURI) {
      throw new Error('MongoDB connection URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI, {
      dbName: 'portfolio'  // specify your database name here
    });
    
    console.log("MongoDB Atlas connected successfully");
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
