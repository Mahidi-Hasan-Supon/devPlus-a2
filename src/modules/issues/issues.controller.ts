import type { Request, Response } from "express";
import { issuesService } from "./issues.service";

const issuesUerCreate = async (req: Request, res: Response) => {
  try {
    const reporter_id = req.user.id;
    const payload = {
      ...req.body,
      reporter_id,
      status: "open",
    };

    const result = await issuesService.issuesCrateIntoDB( payload);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
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

export const issuesController = { issuesUerCreate };
