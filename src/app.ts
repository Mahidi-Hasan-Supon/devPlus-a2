import express, { request, type Application } from "express";
import { pool } from "./db";
import { signupRoute } from "./modules/signup/signup.route";
import { loginRouter } from "./modules/login/login.route";
import { issuesRouter } from "./modules/issues/issues.route";
import logger from "./middleware/logger";
const app: Application = express();

app.use(express.json());
app.use(express.text());
// middleware
app.use(logger)

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth",signupRoute)
app.use("/api/auth" , loginRouter)
app.use("/api/issues" , issuesRouter)



export default app;
