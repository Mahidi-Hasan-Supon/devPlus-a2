import type { Request, Response } from "express";
import { loginService } from "./login.service";

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await loginService.loginUserIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "Login successful",
      data: {
        token: result.accessToken,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          created_at: result.user.created_at,
          updated_at: result.user.updated_at,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const loginController = { loginUser };
