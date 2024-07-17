import express from 'express'
import cors from 'cors';
import { config } from "dotenv";
config();

import initSuperToken from "./utils/initSupertoken.js";
import { connectDB } from './config/database.js'; 
import { errorHandler } from "supertokens-node/framework/express/index.js";
import { middleware } from "supertokens-node/framework/express/index.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from 'cookie-parser/index.js';

connectDB();
initSuperToken();
const app = express()
app.use(errorHandler());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE']}));

const PORT = process.env.PORT || 5000
app.use(middleware());
app.use(express.json());
app.use(cookieParser())
app.use("/api/v1/user", userRoutes);

app.listen(PORT, () => {
    console.log("app is listening on port ", PORT);
})