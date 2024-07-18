import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import EmailPassword from "supertokens-node/recipe/emailpassword/index.js";
import User from "../models/user.js";
import axios from "axios";

axios.defaults.withCredentials = true;

export const registerUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const regRes = await axios.post(`${process.env.APIDOMAIN}/auth/signup`, {
    formFields: [
      {
        id: "email",
        value: email,
      },
      {
        id: "password",  
        value: password,
      },
    ],
  });
  if (regRes.data.status !== "OK") return res.status(409).json({message: "user email already exists"});
  const userId = regRes.data.user.id;
  const uEmail = regRes.data.user.emails[0];
  const isAuth = regRes.data.user.loginMethods[0].verified;
  if (!userId) {
    return res.status(400).json({ message: "User ID is null" });
  }
  const user = await User.create({ userId, email: uEmail, isAuth });
  const responseData = {
    user: {
      id: user.userId,
      email: user.email,
      isAuth: user.isAuth,
      st_access_token: regRes.headers["st-access-token"],
      st_refresh_token: regRes.headers["st-refresh-token"],
      front_token: regRes.headers["front-token"],
    },
  };
  res
    .status(200)
    .json(responseData);
});


export const loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const regRes = await axios.post(`${process.env.APIDOMAIN}/auth/signin`, {
    formFields: [
      {
        id: "email",
        value: email,
      },
      {
        id: "password",
        value: password,
      },
    ],
  });
  if (regRes.data.status !== "OK")
    return res.status(409).json({ message: "no user found" });
  const userId = regRes.data.user.id;
  const user = await User.findOne({ userId });
  const responseData = {
    user: {
      id: user.userId,
      email: user.email,
      isAuth: user.isAuth,
      st_access_token: regRes.headers["st-access-token"],
      st_refresh_token: regRes.headers["st-refresh-token"],
      front_token: regRes.headers["front-token"],
    },
  };
  res
    .status(200)
    .json(responseData);
});


export const onBoardUser = catchAsyncError(async (req, res) => {
  const { phone, firstName, lastName } = req.body;
  const userId = req.session.getUserId();
  const user = await User.findOne({ userId });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  try{
    user.phone = phone;
    user.firstName = firstName;
    user.lastName = lastName;
    user.isAuth = true;
    user.updatedAt = Date.now();
  }catch(e) {
    return res.status(409).json({message: e})
  }
  await user.save();
  res.status(200).json({ message: "User onboarding successful" });
});


// how to initially set the role of an user??
export const changeRole = catchAsyncError(async (req, res, next) => {
  const { email, role } = req.body;
  const userId = req.session.getUserId();
  const user = await User.findOne({ userId });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  userRole = user.role;
  if (userRole !== "admin") {
    return res
      .status(401)
      .json({ message: "you are not authorised for changing role" });
  }
  const changeUser = await User.findOne({ email });
  if (!changeUser) {
    return res.status(404).json({ message: "User with this email found" });
  }
  changeUser.role = role;
  changeUser.updatedAt = Date.now();
  await changeUser.save();
  res.status(200).json({ message: "User role changed successful" });
});


export const getProfile = catchAsyncError(async (req, res) => {
  const userId = req.session.getUserId();
  const user = await User.findOne({ userId });  
  if (!user) {
    return res.status(400).json({ message: "user not found" });
  }
  return res.status(200).json({ message: "user found", user });
});


export const updateProfile = catchAsyncError(async (req, res) => {
  const body = req.body;
  const userId = req.session.getUserId();
  const user = await User.findOne({ userId });
  if (!user) {
    return res.status(400).json({ message: "user not found" });
  }
  if (body.firstName) {
    user.firstName = body.firstName;
  }
  if (body.lastName) {
    user.lastName = body.lastName;
  }
  if (body.phone) {
    user.phone = body.phone;
  }
  user.updatedAt = Date.now();
  await user.save();
  res.status(200).json({ message: "user updated", user });
});


export const resetPassword = catchAsyncError(async (req, res) => {
  const userId = req.session.getUserId();
  const {email} = req.body;
  const user = await User.findOne({userId});
  if(!user) {
    return res.status(400).json({ message: "user not found" });
  }
  if(user.email !== email) {
    return res.status(409).json({ message: "Email is not matching" });
  }
  const resetLink = await EmailPassword.createResetPasswordLink(
    "public",
    userId,
    email
  );
  if(resetLink.status === "OK") {
    console.log(resetLink.link);
    return res.status(200).json({link: resetLink.link});
  }
  res.status(404).json({message: "user not found"});
})





