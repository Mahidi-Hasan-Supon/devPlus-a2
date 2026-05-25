import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;
    // console.log(token);
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized message",
      });
    }
    const decoded = jwt.verify(
      token as string,
      config.secret_key as string,
    ) as JwtPayload;
    //   console.log(decoded);
    const userData = await pool.query(
      `
    SELECT * FROM users WHERE id=$1
    `,
      [decoded.id],
    );
    // console.log(userData);
    const user = userData.rows[0];
    // console.log(user);
    if (userData.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    req.user = decoded;
    // req.user = {
    //   id: userData.rows[0].id,
    //   name: userData.rows[0].name,
    //   role: userData.rows[0].role,
    // };
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Unauthorized message",
      error: error.message,
    });
  }
};

export default auth;
