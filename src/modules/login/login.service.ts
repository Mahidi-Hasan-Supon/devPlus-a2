import bcrypt from "bcryptjs";
import { pool } from "../../db";
import jwt from "jsonwebtoken";
import config from "../../config";
import { access } from "node:fs";

const loginUserIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;
  // console.log(email , password);
  // 1 varify email
  // 2 check password
  // 3 verify token generation
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email=$1 
        `,
    [email],
  );
  //   console.log(userData.rows[0]);
  const user = userData.rows[0];
  if (userData.rows.length === 0) {
    throw new Error("User not found");
  }
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid password");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };
  const accessToken = jwt.sign(jwtPayload, config.secret_key as string, {
    expiresIn: "1d",
  });
  // console.log(accessToken);
  return { accessToken, user };
};

export const loginService = { loginUserIntoDB };
