import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import EmailPassword from "supertokens-node/recipe/emailpassword/index.js";
import User from "../models/user.js";
import axios from "axios";
import crypto from "crypto";

const secretKey = "4468e2258d6c36fc5f199876a96d10252628ed8d2357dfc11afa424d2bfd3c31";

const encrypt = (text, secretKey) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey, "hex"),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

const liveChatClientIdHash = encrypt(
  "3a6ae59037cca9ebf287e4980b76f50d",
  secretKey
);

const liveChatOrganizationIdHash = encrypt(
  "5a5d4614-d8e7-4003-b763-93fc9541c4d4",
  secretKey
);

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
      liveChatClientIdHash,
      liveChatOrganizationIdHash
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
      liveChatClientIdHash,
      liveChatOrganizationIdHash,
    },
  };
  res
    .status(200)
    .json(responseData);
});


export const onBoardUser = catchAsyncError(async (req, res) => {
  const { phone, firstName, lastName, useProduct, companyFind } = req.body;
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
    user.companyFind = companyFind;
    user.useProduct = useProduct;
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


export const refreshToken = catchAsyncError(async (req, res, next) => {
  const {refreshToken} = req.body;
  const resp = await axios.post(
    `${process.env.APIDOMAIN}/auth/session/refresh`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
      withCredentials: true,
    }
  );
  if (resp.status !== 200)
    return res.status(409).json({ message: "error while operating with refresh token" });
  const responseData = {
    tokens: {
      st_access_token: resp.headers["st-access-token"],
      st_refresh_token: resp.headers["st-refresh-token"],
      front_token: resp.headers["front-token"]
    },
  };
  res.status(200).json(responseData);
});


export const signinup = catchAsyncError(async (req, res, next) => {
  console.log(req.body)
  console.log(req.headers.cookie);
  const userId = req.body.user.id
  const email = req.body.user.emails[0]
  const method = req.body.method
  const accessToken = req.headers.cookie.match(/sAccessToken=([^;]+)/)[1];
  if(method == "signUp"){
    console.log("inside signup")
    const user = await User.create({ userId, email, isAuth: true });
    console.log("access = ", accessToken);
    const resp = {
      id: userId,
      email: email,
      isAuth: true,
      st_access_token: accessToken,
      liveChatClientIdHash,
      liveChatOrganizationIdHash,
    };
    console.log(resp)
    res.status(200).json(resp);
  }
  else {
  console.log("inside signin")
  const user = await User.findOne({ userId })
  const resp = {
      id: userId,
      email: email,
      isAuth: user.isAuth,
      st_access_token: accessToken,
      liveChatClientIdHash,
      liveChatOrganizationIdHash,
  }
  console.log(resp)
  res.status(200).json(resp);
}
})