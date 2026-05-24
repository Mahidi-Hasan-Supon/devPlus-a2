import { pool } from "../../db";
import type { IUser } from "./signup.interface";
import bcrypt from "bcryptjs";

const signupUserIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  console.log(hashPassword);
  if (role) {
    const result = await pool.query(
      `
    INSERT INTO users (name,email,password,role)
    VALUES ($1,$2,$3,$4) RETURNING *
    `,
      [name, email, hashPassword, role],
    );
    delete result.rows[0].password;
    return result;
  } else {
    const result = await pool.query(
      `
    INSERT INTO users (name,email,password)
    VALUES ($1,$2,$3) RETURNING *
    `,
      [name, email, hashPassword],
    );
    delete result.rows[0].password;
    return result;
  }
};
export const signupService = { signupUserIntoDB };
