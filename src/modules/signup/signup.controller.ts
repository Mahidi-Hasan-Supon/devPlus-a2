import type { Request, Response } from "express";
import { signupService } from "./signup.service";

const signUpUser = async (req:Request, res : Response) => {
//   const { name, email, password, role } = req.body;
  // console.log(name , email , password , role);
  try {
    const result = await signupService.signupUserIntoDB(req.body)
    // console.log(result);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};
export const signupController = {
    signUpUser
}