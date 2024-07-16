import mongoose from "mongoose";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";

export const connectDB = catchAsyncError(async () => { //conecting dataase mongo
  const conn = await mongoose.connect(process.env.DBURI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
});
