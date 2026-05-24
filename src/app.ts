import express, { type Application } from "express";
import { pool } from "./db";
const app: Application = express();

app.use(express.json());
app.use(express.text());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  // console.log(name , email , password , role);
  try {
    const result = await pool.query(
      `
    INSERT INTO users (name,email,password,role)
    VALUES ($1,$2,$3,$4) RETURNING *
    `,
      [name, email, password, role],
    );
    // console.log(result);
    res.status(200).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error : any) {
     res.status(500).json({
       success:false,
       message:error.message,
       error:error
     })
  }
});

export default app;
