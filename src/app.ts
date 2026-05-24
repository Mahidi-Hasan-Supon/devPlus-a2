import express, { type Application } from "express";
import { pool } from "./db";
import { signupRoute } from "./modules/signup/signup.route";
import { loginRouter } from "./modules/login/login.route";
const app: Application = express();

app.use(express.json());
app.use(express.text());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth",signupRoute)
app.use("/api/auth" , loginRouter)
export default app;
