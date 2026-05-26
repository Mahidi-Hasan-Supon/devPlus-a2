import { type Request, type Response } from "express";
import { issuesService } from "./issues.service";
import type { JwtPayload } from "jsonwebtoken";

const issuesUerCreate = async (req: Request, res: Response) => {
  console.log(req.user);

  try {
    const reporter_id = req.user?.id;
    // console.log(reporter_id);
    const payload = {
      ...req.body,
      reporter_id,
      // status: "open",
    };

    const result = await issuesService.issuesCrateIntoDB(payload);

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

// get all issues
const issueAllUser = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.issuesAllFromDB(req.query);

    res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

// get id by issues
const singleIssues = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // validation

    const result = await issuesService.issuesIdGet(id as string);
    res.status(200).json({
      success: true,
      message: "Issue retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};
// patch isssues
const updateIssues = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issuesService.issuesUpdateFromDB(
      req.body,
      id as string,
      req.user,
    );
    // console.log(result);
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
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
// delete
const deleteIssues = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const result = await issuesService.deleteIssueFromDB(id as string);
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const issuesController = {
  issuesUerCreate,
  issueAllUser,
  singleIssues,
  updateIssues,
  deleteIssues
};
