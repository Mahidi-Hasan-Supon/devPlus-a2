import express, { Request, request, Response, type Application } from "express";
import { pool } from "./db";
import { signupRoute } from "./modules/signup/signup.route";
import { loginRouter } from "./modules/login/login.route";
import { issuesRouter } from "./modules/issues/issues.route";
import logger from "./middleware/logger";
import cors from "cors";
// import type Request = require("express");
// import type Response = require("express");
const app: Application = express();

const corsOptions = {
  origin: "http://localhost:3000",
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
// middleware
app.use(logger);

app.get("/", (req : Request, res : Response) => {
  // res.send("Hello World!");
  res.status(200).json({
    message: "Express server",
  });
});

app.use("/api/auth", signupRoute);
app.use("/api/auth", loginRouter);
app.use("/api/issues", issuesRouter);

export default app;
