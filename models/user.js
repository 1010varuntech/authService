import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [false, "Please provide a first name"],
  },
  lastName: {
    type: String,
    required: [false, "Please provide a last name"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  userId: {
    //user id from super tokens
    type: String,
    required: [true, "Please provide a userId"],
    unique: true,
  },
  userName: {
    type: String,
    required: [false, "Please provide a userName"],
  },
  techStackEmail: {
    type: String,
    required: [false, "Please provide a techStackEmail"],
  },
  isAuth: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  phone: {
    type: String,
    required: [false, "Please provide a phone number"],
  },
  planId: {
    type: String,
    required: [false, "Please provide a plan id"],
  },
  //array of human chat ids
  humanChats: [
    {
      humanMesage: String,
      aiMessage: String,
      humanTime: Date,
      aiTime: Date,
    },
  ],
  organizationId: {
    type: String,
    required: [false, "Please provide a organization id"],
  },
  customerId: {
    //stripe customer id
    type: String,
    required: [false, "Please provide a customer id"],
  },
  invoicesId: [
    {
      invoiceId: String,
      date: Date,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
  companyFind: {
    type: String,
    required: [false, "Please provide where you find this company"],
  },
  useProduct: {
    type: String,
    required: [false, "How do you plan to use this product"],
  },
});

const User = mongoose.model("User", userSchema);

export default User;